import os
import time
import random
import psycopg2
import asyncio
from asyncio import Queue
import datetime
import pandas as pd
from nba_api.stats.static import players
from nba_api.stats.endpoints import playergamelog
from dotenv import load_dotenv

# ----------------------------
# Load environment variables
# ----------------------------
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found. Check your .env file.")

semaphore = asyncio.Semaphore(3)  # limit to 3 concurrent player requests


# --------------------------------------
# Connect to PostgreSQL
# --------------------------------------
def connect_db():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        print("✅ Connected successfully to database")
        return conn, cur
    except Exception as e:
        print("❌ DB connection failed:", e)
        raise


# --------------------------------------
# Fetch player game log (blocking)
# --------------------------------------
def fetch_player_gamelog(player_id, season, retries=3, backoff=2):
    attempt = 0
    while attempt < retries:
        try:
            gamelog = playergamelog.PlayerGameLog(player_id=player_id, season=season)
            return gamelog.get_data_frames()[0]
        except Exception as e:
            attempt += 1
            wait = backoff**attempt
            print(f"⚠️ Retry {attempt}/{retries} for player {player_id} in {wait}s: {e}")
            time.sleep(wait)
    print(f"❌ Skipped player {player_id} after {retries} retries")
    return pd.DataFrame()


# --------------------------------------
# UPSERT query
# --------------------------------------
UPSERT_QUERY = """
INSERT INTO game_logs (
  player_id, game_id, season_id, game_date, matchup, win_loss, minutes,
  fgm, fga, fg3m, fg3a, ftm, fta, oreb, dreb, treb, ast, stl, blk, tov,
  pf, pts, plus_minus
)
VALUES (
  %(player_id)s, %(GAME_ID)s, '2025-26', %(GAME_DATE)s, %(MATCHUP)s, %(WL)s, %(MIN)s,
  %(FGM)s, %(FGA)s, %(FG3M)s, %(FG3A)s, %(FTM)s, %(FTA)s, %(OREB)s, %(DREB)s, %(REB)s,
  %(AST)s, %(STL)s, %(BLK)s, %(TOV)s, %(PF)s, %(PTS)s, %(PLUS_MINUS)s
)
ON CONFLICT (player_id, game_id)
DO UPDATE SET
  minutes = EXCLUDED.minutes,
  fgm = EXCLUDED.fgm,
  fga = EXCLUDED.fga,
  fg3m = EXCLUDED.fg3m,
  fg3a = EXCLUDED.fg3a,
  ftm = EXCLUDED.ftm,
  fta = EXCLUDED.fta,
  oreb = EXCLUDED.oreb,
  dreb = EXCLUDED.dreb,
  treb = EXCLUDED.treb,
  ast = EXCLUDED.ast,
  stl = EXCLUDED.stl,
  blk = EXCLUDED.blk,
  tov = EXCLUDED.tov,
  pf = EXCLUDED.pf,
  pts = EXCLUDED.pts,
  plus_minus = EXCLUDED.plus_minus;
"""


# --------------------------------------
# Async player processing
# --------------------------------------
async def process_player(player, latest_games, lock, conn, cur):
    try:
        loop = asyncio.get_event_loop()
        print(f"[{datetime.datetime.now().time()}] Fetching {player['full_name']}...")

        # Run blocking fetch in thread
        df = await loop.run_in_executor(
            None, fetch_player_gamelog, player["id"], "2025-26"
        )
        if df.empty:
            return 0

        # Filter new games
        last_game_date = latest_games.get(player["id"])
        if last_game_date:
            df = df[pd.to_datetime(df["GAME_DATE"]) > last_game_date]
        if df.empty:
            return 0

        df = df.copy()
        df.loc[:, "player_id"] = player["id"]
        df.loc[:, "player_name"] = player["full_name"]

        inserted = 0
        for _, row in df.iterrows():
            record = {
                "player_id": row.get("Player_ID") or row.get("player_id"),
                "GAME_ID": row.get("Game_ID"),
                "GAME_DATE": row.get("GAME_DATE"),
                "MATCHUP": row.get("MATCHUP"),
                "WL": row.get("WL"),
                "MIN": row.get("MIN"),
                "FGM": row.get("FGM"),
                "FGA": row.get("FGA"),
                "FG3M": row.get("FG3M"),
                "FG3A": row.get("FG3A"),
                "FTM": row.get("FTM"),
                "FTA": row.get("FTA"),
                "OREB": row.get("OREB"),
                "DREB": row.get("DREB"),
                "REB": row.get("REB"),
                "AST": row.get("AST"),
                "STL": row.get("STL"),
                "BLK": row.get("BLK"),
                "TOV": row.get("TOV"),
                "PF": row.get("PF"),
                "PTS": row.get("PTS"),
                "PLUS_MINUS": row.get("PLUS_MINUS"),
            }
            if not record["GAME_ID"]:
                continue

            async with lock:
                try:
                    cur.execute(UPSERT_QUERY, record)
                    inserted += 1
                except psycopg2.InterfaceError:
                    print("🔄 Connection lost, reconnecting...")
                    conn, cur = connect_db()
                    cur.execute(UPSERT_QUERY, record)
                    inserted += 1
                except Exception as e:
                    print(
                        f"❌ Failed to insert {record['player_id']} {record['GAME_ID']}: {e}"
                    )

        conn.commit()
        print(f"✅ {player['full_name']} — {inserted} new games inserted")
        # await asyncio.sleep(0.5 + random.random() * 0.5)
        return inserted
    except Exception as e:
        print(f"❌ Failed for {player['full_name']}: {e}")
        return 0


# --------------------------------------
# Main async entry
# --------------------------------------
total_lock = asyncio.Lock()
total = {"count": 0}


async def worker(name, queue, latest_games, lock, conn, cur, total):
    while not queue.empty():
        player = await queue.get()
        inserted = await process_player(player, latest_games, lock, conn, cur)

        # Add to total with lock
        async with total_lock:
            total["count"] += inserted

        # Sleep after finishing this player to avoid API rate limits
        await asyncio.sleep(1.5 + random.random() * 0.5)
        queue.task_done()


async def main():
    conn, cur = connect_db()

    cur.execute(
        """
        SELECT player_id, MAX(game_date) AS latest_game
        FROM game_logs
        GROUP BY player_id
    """
    )
    latest_games = {row[0]: row[1] for row in cur.fetchall()}

    lock = asyncio.Lock()
    active_players = players.get_active_players()

    queue = Queue()
    for p in active_players:
        queue.put_nowait(p)

    # Only 3 concurrent workers
    workers = [
        asyncio.create_task(
            worker(f"Worker-{i}", queue, latest_games, lock, conn, cur, total)
        )
        for i in range(3)
    ]

    await queue.join()  # wait until all tasks are done
    for w in workers:
        w.cancel()

    print(f"\n✅ All done! Total inserted/updated: {total['count']}")
    cur.close()
    conn.close()


if __name__ == "__main__":
    asyncio.run(main())

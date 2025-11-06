from nba_api.stats.endpoints import playergamelog
from nba_api.stats.static import players
import pandas as pd
import psycopg2
import os
import time
import json
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

try:
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    print("✅ Connected successfully!")

    # Try inserting one fake row
    test_row = {
        "player_id": 9999,
        "game_id": "TEST123",
        "season_id": "2025-26",
        "game_date": "2025-11-05 00:00:00",
        "matchup": "FAKE vs TEAM",
        "win_loss": "W",
        "minutes": 30,
        "fgm": 10,
        "fga": 20,
        "fg3m": 5,
        "fg3a": 10,
        "ftm": 3,
        "fta": 4,
        "oreb": 1,
        "dreb": 4,
        "treb": 5,
        "ast": 7,
        "stl": 2,
        "blk": 1,
        "tov": 3,
        "pf": 2,
        "pts": 28,
        "plus_minus": 15,
    }

    cur.execute(
        """
        INSERT INTO game_logs (
          player_id, game_id, season_id, game_date, matchup, win_loss,
          minutes, fgm, fga, fg3m, fg3a, ftm, fta, oreb, dreb, treb, ast,
          stl, blk, tov, pf, pts, plus_minus
        )
        VALUES (
          %(player_id)s, %(game_id)s, %(season_id)s, %(game_date)s, %(matchup)s, %(win_loss)s,
          %(minutes)s, %(fgm)s, %(fga)s, %(fg3m)s, %(fg3a)s, %(ftm)s, %(fta)s, %(oreb)s, %(dreb)s,
          %(treb)s, %(ast)s, %(stl)s, %(blk)s, %(tov)s, %(pf)s, %(pts)s, %(plus_minus)s
        )
        ON CONFLICT (player_id, game_id)
        DO UPDATE SET
          minutes = EXCLUDED.minutes,
          pts = EXCLUDED.pts;
    """,
        test_row,
    )

    conn.commit()
    print("✅ Test row inserted or updated successfully!")

except Exception as e:
    print("❌ Connection or insert failed:", e)

finally:
    if "cur" in locals():
        cur.close()
    if "conn" in locals():
        conn.close()

# # Show all rows
# pd.set_option("display.max_rows", None)

# # Show all columns
# pd.set_option("display.max_columns", None)

# # Show full column width (avoid truncation)
# pd.set_option("display.max_colwidth", None)

# active_players = players.get_active_players()
# all_game_logs = []

# # 2. Loop through each player
# for idx, player in enumerate(active_players, 1):
#     try:
#         print(f"[{idx}/{len(active_players)}] Fetching {player['full_name']}")
#         gamelog = playergamelog.PlayerGameLog(player_id=player["id"], season="2025-26")
#         df = gamelog.get_data_frames()[0]  # DataFrame of games

#         # Add player info to each row
#         df["player_id"] = player["id"]
#         df["player_name"] = player["full_name"]

#         # Convert DataFrame to dicts and append
#         all_game_logs.extend(df.to_dict(orient="records"))

#         # Optional: pause to avoid rate limits
#         time.sleep(0.6)

#     except Exception as e:
#         print(f"Failed for {player['full_name']}: {e}")

# # 3. Save all games to a JSON file
# output_file = "all_players_2025_26_game_logs.json"
# with open(output_file, "w") as f:
#     json.dump(all_game_logs, f, indent=2)

# print(f"Saved {len(all_game_logs)} game logs to {output_file}")

import os
import psycopg2
from dotenv import load_dotenv

# ----------------------------
# Load environment variables
# ----------------------------
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found. Check your .env file.")


def connect_db():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        print("✅ Connected successfully to database")
        return conn, cur
    except Exception as e:
        print("❌ DB connection failed:", e)
        raise


def update_season_averages(season_id: str = "2025-26"):
    conn, cur = connect_db()

    print(f"📊 Updating season_stats for {season_id}...")

    cur.execute(
        f"""
        INSERT INTO season_stats (
          player_id, season_id, gp, pts, tpm, reb, ast, stl, blk, tov, fgp, fga, ftp, fta, updated_at
        )
        SELECT
          player_id,
          season_id,
          COUNT(*) AS gp,
          AVG(pts) AS pts,
          AVG(fg3m) AS tpm,
          AVG(treb) AS reb,
          AVG(ast) AS ast,
          AVG(stl) AS stl,
          AVG(blk) AS blk,
          AVG(tov) AS tov,
          (AVG(fgm) / NULLIF(AVG(fga), 0)) AS fgp,
          AVG(fga) AS fga,
          (AVG(ftm) / NULLIF(AVG(fta), 0)) AS ftp,
          AVG(fta) AS fta,
          NOW() AS updated_at
        FROM game_logs
        WHERE season_id = %s
        GROUP BY player_id, season_id
        ON CONFLICT (player_id, season_id)
        DO UPDATE SET
          gp = EXCLUDED.gp,
          pts = EXCLUDED.pts,
          tpm = EXCLUDED.tpm,
          reb = EXCLUDED.reb,
          ast = EXCLUDED.ast,
          stl = EXCLUDED.stl,
          blk = EXCLUDED.blk,
          tov = EXCLUDED.tov,
          fgp = EXCLUDED.fgp,
          fga = EXCLUDED.fga,
          ftp = EXCLUDED.ftp,
          fta = EXCLUDED.fta,
          updated_at = NOW();
        """,
        (season_id,),
    )

    conn.commit()
    print("✅ season_stats successfully updated.")

    cur.close()
    conn.close()


if __name__ == "__main__":
    update_season_averages()

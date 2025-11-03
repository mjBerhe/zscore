from nba_api.stats.endpoints import playergamelog
from nba_api.stats.static import players
import pandas as pd
import time
import json

# Show all rows
pd.set_option("display.max_rows", None)

# Show all columns
pd.set_option("display.max_columns", None)

# Show full column width (avoid truncation)
pd.set_option("display.max_colwidth", None)

active_players = players.get_active_players()
all_game_logs = []

# 2. Loop through each player
for idx, player in enumerate(active_players, 1):
    try:
        print(f"[{idx}/{len(active_players)}] Fetching {player['full_name']}")
        gamelog = playergamelog.PlayerGameLog(player_id=player["id"], season="2025-26")
        df = gamelog.get_data_frames()[0]  # DataFrame of games

        # Add player info to each row
        df["player_id"] = player["id"]
        df["player_name"] = player["full_name"]

        # Convert DataFrame to dicts and append
        all_game_logs.extend(df.to_dict(orient="records"))

        # Optional: pause to avoid rate limits
        time.sleep(0.6)

    except Exception as e:
        print(f"Failed for {player['full_name']}: {e}")

# 3. Save all games to a JSON file
output_file = "all_players_2025_26_game_logs.json"
with open(output_file, "w") as f:
    json.dump(all_game_logs, f, indent=2)

print(f"Saved {len(all_game_logs)} game logs to {output_file}")

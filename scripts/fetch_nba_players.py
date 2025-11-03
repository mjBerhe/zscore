from nba_api.stats.endpoints import playergamelog, PlayerIndex
from nba_api.stats.static import players
import pandas as pd

# Show all rows
pd.set_option("display.max_rows", None)

# Show all columns
pd.set_option("display.max_columns", None)

# Show full column width (avoid truncation)
pd.set_option("display.max_colwidth", None)


# Get all players
player_index = PlayerIndex()  # No arguments returns all players
df_all_players = player_index.get_data_frames()[0]

print(df_all_players.head())  # See the first few players
print(df_all_players.columns)  # Inspect the columns

# Optional: save to CSV
df_all_players.to_csv("all_nba_players.csv", index=False)

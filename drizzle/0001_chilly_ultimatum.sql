CREATE TABLE "game_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"game_id" text NOT NULL,
	"season_id" text NOT NULL,
	"game_date" timestamp NOT NULL,
	"matchup" text NOT NULL,
	"win_loss" text NOT NULL,
	"minutes" integer,
	"fgm" integer,
	"fga" integer,
	"fg3m" integer,
	"fg3a" integer,
	"ftm" integer,
	"fta" integer,
	"oreb" integer,
	"dreb" integer,
	"treb" integer,
	"ast" integer,
	"stl" integer,
	"blk" integer,
	"tov" integer,
	"pf" integer,
	"pts" integer,
	"plus_minus" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "season_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"team" text,
	"season_id" text NOT NULL,
	"gp" real,
	"pts" real,
	"threepm" real,
	"reb" real,
	"ast" real,
	"stl" real,
	"blk" real,
	"tov" real,
	"fgp" real,
	"fga" real,
	"ftp" real,
	"fta" real,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "projections" DROP CONSTRAINT "projections_player_id_players_id_fk";
--> statement-breakpoint
ALTER TABLE "players" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "first_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "last_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "team_id" integer;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "team_slug" text;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "team_city" text;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "team_name" text;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "team_abbreviation" text;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "jersey" text;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "height" text;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "weight" integer;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "college" text;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "draft_year" integer;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "draft_round" integer;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "draft_number" integer;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "is_active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "created_at" text;--> statement-breakpoint
ALTER TABLE "projections" ADD COLUMN "player_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "projections" ADD COLUMN "tov" real;--> statement-breakpoint
ALTER TABLE "projections" ADD COLUMN "fgp" real;--> statement-breakpoint
ALTER TABLE "projections" ADD COLUMN "fga" real;--> statement-breakpoint
ALTER TABLE "projections" ADD COLUMN "ftp" real;--> statement-breakpoint
ALTER TABLE "projections" ADD COLUMN "fta" real;--> statement-breakpoint
CREATE UNIQUE INDEX "player_game_unique" ON "game_logs" USING btree ("player_id","game_id");--> statement-breakpoint
CREATE UNIQUE INDEX "player_season_unique" ON "season_stats" USING btree ("player_id","season_id");--> statement-breakpoint
ALTER TABLE "players" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "players" DROP COLUMN "team";--> statement-breakpoint
ALTER TABLE "projections" DROP COLUMN "player_id";--> statement-breakpoint
ALTER TABLE "projections" DROP COLUMN "fg_pct";--> statement-breakpoint
ALTER TABLE "projections" DROP COLUMN "ft_pct";--> statement-breakpoint
ALTER TABLE "projections" DROP COLUMN "to";
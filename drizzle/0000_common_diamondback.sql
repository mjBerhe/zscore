CREATE TABLE "players" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"team" text,
	"position" text
);
--> statement-breakpoint
CREATE TABLE "projections" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer,
	"source" text NOT NULL,
	"season" integer NOT NULL,
	"gp" real,
	"fg_pct" real,
	"ft_pct" real,
	"threepm" real,
	"reb" real,
	"ast" real,
	"stl" real,
	"blk" real,
	"to" real,
	"pts" real
);
--> statement-breakpoint
ALTER TABLE "projections" ADD CONSTRAINT "projections_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;
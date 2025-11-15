CREATE TABLE "fantasy_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"platform" text NOT NULL,
	"league_id" text NOT NULL,
	"team_id" text NOT NULL,
	"team_name" text,
	"owner_name" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "players" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "players" ALTER COLUMN "created_at" SET DEFAULT now();
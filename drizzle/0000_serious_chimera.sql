CREATE TYPE "public"."schedule_type" AS ENUM('촬영', '편집', '미팅', '납품');--> statement-breakpoint
CREATE TABLE "schedules" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"type" "schedule_type" NOT NULL,
	"manager" text NOT NULL,
	"location" text NOT NULL,
	"created_at" bigint NOT NULL
);

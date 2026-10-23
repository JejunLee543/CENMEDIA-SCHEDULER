CREATE TABLE "schedule_notes" (
	"id" text PRIMARY KEY NOT NULL,
	"schedule_id" text NOT NULL,
	"content" text NOT NULL,
	"author" text,
	"created_at" bigint NOT NULL
);
--> statement-breakpoint
ALTER TABLE "schedule_notes" ADD CONSTRAINT "schedule_notes_schedule_id_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "schedule_notes_schedule_id_idx" ON "schedule_notes" USING btree ("schedule_id");
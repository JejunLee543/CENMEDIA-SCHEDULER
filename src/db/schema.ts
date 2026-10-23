import { relations } from "drizzle-orm";
import { bigint, date, index, pgEnum, pgTable, text, time } from "drizzle-orm/pg-core";
import { SCHEDULE_TYPES } from "@/types/schedule";

export const scheduleTypeEnum = pgEnum("schedule_type", SCHEDULE_TYPES);

export const schedules = pgTable("schedules", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  date: date("date", { mode: "string" }).notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  type: scheduleTypeEnum("type").notNull(),
  manager: text("manager").notNull(),
  location: text("location").notNull(),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export const scheduleNotes = pgTable(
  "schedule_notes",
  {
    id: text("id").primaryKey(),
    scheduleId: text("schedule_id")
      .notNull()
      .references(() => schedules.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    author: text("author"),
    createdAt: bigint("created_at", { mode: "number" }).notNull(),
  },
  (t) => [index("schedule_notes_schedule_id_idx").on(t.scheduleId)],
);

export const schedulesRelations = relations(schedules, ({ many }) => ({
  notes: many(scheduleNotes),
}));

export const scheduleNotesRelations = relations(scheduleNotes, ({ one }) => ({
  schedule: one(schedules, {
    fields: [scheduleNotes.scheduleId],
    references: [schedules.id],
  }),
}));

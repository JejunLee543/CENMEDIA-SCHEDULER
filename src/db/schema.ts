import { bigint, date, pgEnum, pgTable, text, time } from "drizzle-orm/pg-core";
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

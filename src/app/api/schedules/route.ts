import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { schedules } from "@/db/schema";
import { SCHEDULE_TYPES, type Schedule } from "@/types/schedule";

export async function GET() {
  const rows = await db.select().from(schedules).orderBy(desc(schedules.createdAt));
  const result: Schedule[] = rows.map((row) => ({
    ...row,
    startTime: row.startTime.slice(0, 5),
    endTime: row.endTime.slice(0, 5),
  }));
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<Omit<Schedule, "id" | "createdAt">>;

  if (
    !body.title?.trim() ||
    !body.date ||
    !body.startTime ||
    !body.endTime ||
    !body.manager?.trim() ||
    !body.location?.trim() ||
    !body.type ||
    !SCHEDULE_TYPES.includes(body.type)
  ) {
    return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
  }

  const schedule: Schedule = {
    title: body.title.trim(),
    date: body.date,
    startTime: body.startTime,
    endTime: body.endTime,
    type: body.type,
    manager: body.manager.trim(),
    location: body.location.trim(),
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };

  await db.insert(schedules).values(schedule);

  return NextResponse.json(schedule, { status: 201 });
}

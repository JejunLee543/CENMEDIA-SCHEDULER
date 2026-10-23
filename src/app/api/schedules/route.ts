import { NextResponse } from "next/server";
import { db } from "@/db";
import { schedules } from "@/db/schema";
import { SCHEDULE_TYPES, type Schedule, type ScheduleWithNotes } from "@/types/schedule";

export async function GET() {
  const rows = await db.query.schedules.findMany({
    orderBy: (schedules, { desc }) => [desc(schedules.createdAt)],
    with: { notes: { orderBy: (notes, { asc }) => [asc(notes.createdAt)] } },
  });
  const result: ScheduleWithNotes[] = rows.map((row) => ({
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

  const result: ScheduleWithNotes = { ...schedule, notes: [] };
  return NextResponse.json(result, { status: 201 });
}

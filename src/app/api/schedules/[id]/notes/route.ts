import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { scheduleNotes, schedules } from "@/db/schema";
import type { ScheduleNote } from "@/types/schedule";

export async function GET(_request: Request, ctx: RouteContext<"/api/schedules/[id]/notes">) {
  const { id } = await ctx.params;
  const notes: ScheduleNote[] = await db
    .select()
    .from(scheduleNotes)
    .where(eq(scheduleNotes.scheduleId, id))
    .orderBy(asc(scheduleNotes.createdAt));
  return NextResponse.json(notes);
}

export async function POST(request: Request, ctx: RouteContext<"/api/schedules/[id]/notes">) {
  const { id } = await ctx.params;
  const body = (await request.json()) as Partial<Pick<ScheduleNote, "content" | "author">>;

  if (!body.content?.trim()) {
    return NextResponse.json({ error: "메모 내용을 입력하세요." }, { status: 400 });
  }

  const [schedule] = await db
    .select({ id: schedules.id })
    .from(schedules)
    .where(eq(schedules.id, id));
  if (!schedule) {
    return NextResponse.json({ error: "일정을 찾을 수 없습니다." }, { status: 404 });
  }

  const note: ScheduleNote = {
    id: crypto.randomUUID(),
    scheduleId: id,
    content: body.content.trim(),
    author: body.author?.trim() || null,
    createdAt: Date.now(),
  };

  await db.insert(scheduleNotes).values(note);

  return NextResponse.json(note, { status: 201 });
}

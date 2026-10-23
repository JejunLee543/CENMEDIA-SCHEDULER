import { DrizzleQueryError } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { scheduleNotes } from "@/db/schema";
import type { ScheduleNote } from "@/types/schedule";

const FOREIGN_KEY_VIOLATION = "23503";

export async function POST(request: Request, ctx: RouteContext<"/api/schedules/[id]/notes">) {
  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const { content, author } = (body ?? {}) as Record<string, unknown>;
  if (typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "메모 내용을 입력하세요." }, { status: 400 });
  }
  if (author != null && typeof author !== "string") {
    return NextResponse.json({ error: "잘못된 작성자입니다." }, { status: 400 });
  }

  const note: ScheduleNote = {
    id: crypto.randomUUID(),
    scheduleId: id,
    content: content.trim(),
    author: author?.trim() || null,
    createdAt: Date.now(),
  };

  try {
    await db.insert(scheduleNotes).values(note);
  } catch (err) {
    // The FK on schedule_id rejects notes for a schedule that doesn't exist (or was just deleted)
    const cause = err instanceof DrizzleQueryError ? err.cause : err;
    if ((cause as { code?: string } | undefined)?.code === FOREIGN_KEY_VIOLATION) {
      return NextResponse.json({ error: "일정을 찾을 수 없습니다." }, { status: 404 });
    }
    throw err;
  }

  return NextResponse.json(note, { status: 201 });
}

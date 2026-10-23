import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { scheduleNotes } from "@/db/schema";

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/schedules/[id]/notes/[noteId]">,
) {
  const { id, noteId } = await ctx.params;
  const deleted = await db
    .delete(scheduleNotes)
    .where(and(eq(scheduleNotes.id, noteId), eq(scheduleNotes.scheduleId, id)))
    .returning({ id: scheduleNotes.id });

  if (deleted.length === 0) {
    return NextResponse.json({ error: "메모를 찾을 수 없습니다." }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}

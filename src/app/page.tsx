"use client";

import { useEffect, useState } from "react";
import ScheduleForm from "@/components/ScheduleForm";
import ScheduleList from "@/components/ScheduleList";
import type { NoteInput } from "@/components/ScheduleNotes";
import type { Schedule, ScheduleNote, ScheduleWithNotes } from "@/types/schedule";

export default function Home() {
  const [schedules, setSchedules] = useState<ScheduleWithNotes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/schedules")
      .then((res) => res.json())
      .then((data: ScheduleWithNotes[]) => setSchedules(data))
      .catch(() => setError("일정을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, []);

  const handleAddSchedule = async (schedule: Omit<Schedule, "id" | "createdAt">) => {
    const res = await fetch("/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(schedule),
    });

    if (!res.ok) {
      setError("일정 등록에 실패했습니다.");
      return;
    }

    const newSchedule: ScheduleWithNotes = await res.json();
    setSchedules((prev) => [newSchedule, ...prev].sort((a, b) => b.createdAt - a.createdAt));
    setError(null);
  };

  const handleAddNote = async (scheduleId: string, note: NoteInput) => {
    try {
      const res = await fetch(`/api/schedules/${scheduleId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(note),
      });
      if (!res.ok) throw new Error();

      const newNote: ScheduleNote = await res.json();
      setSchedules((prev) =>
        prev.map((s) => (s.id === scheduleId ? { ...s, notes: [...s.notes, newNote] } : s))
      );
      setError(null);
      return true;
    } catch {
      setError("메모 등록에 실패했습니다.");
      return false;
    }
  };

  const handleDeleteNote = async (scheduleId: string, noteId: string) => {
    try {
      const res = await fetch(`/api/schedules/${scheduleId}/notes/${noteId}`, {
        method: "DELETE",
      });
      // 404 means the note is already gone, so drop it from the list either way
      if (!res.ok && res.status !== 404) throw new Error();

      setSchedules((prev) =>
        prev.map((s) =>
          s.id === scheduleId ? { ...s, notes: s.notes.filter((n) => n.id !== noteId) } : s
        )
      );
      setError(null);
    } catch {
      setError("메모 삭제에 실패했습니다.");
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10 flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-bold">일정 관리</h1>
        <p className="mt-1 text-sm text-black/60 dark:text-white/60">
          촬영, 편집, 미팅, 납품 일정을 등록하고 최신순으로 확인하세요.
        </p>
      </header>

      <ScheduleForm onSubmit={handleAddSchedule} />

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">등록된 일정</h2>
        {loading ? (
          <p className="text-sm text-black/60 dark:text-white/60">불러오는 중...</p>
        ) : (
          <ScheduleList
            schedules={schedules}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
          />
        )}
      </section>
    </main>
  );
}

"use client";

import { useState } from "react";
import ScheduleForm from "@/components/ScheduleForm";
import ScheduleList from "@/components/ScheduleList";
import type { Schedule } from "@/types/schedule";

export default function Home() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const handleAddSchedule = (schedule: Omit<Schedule, "id" | "createdAt">) => {
    const newSchedule: Schedule = {
      ...schedule,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setSchedules((prev) => [newSchedule, ...prev].sort((a, b) => b.createdAt - a.createdAt));
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

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">등록된 일정</h2>
        <ScheduleList schedules={schedules} />
      </section>
    </main>
  );
}

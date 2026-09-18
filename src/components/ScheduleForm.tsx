"use client";

import { useState, type FormEvent } from "react";
import { SCHEDULE_TYPES, type Schedule, type ScheduleType } from "@/types/schedule";

interface ScheduleFormProps {
  onSubmit: (schedule: Omit<Schedule, "id" | "createdAt">) => void;
}

const emptyForm = {
  title: "",
  date: "",
  startTime: "",
  endTime: "",
  type: SCHEDULE_TYPES[0] as ScheduleType,
  manager: "",
  location: "",
};

export default function ScheduleForm({ onSubmit }: ScheduleFormProps) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof typeof emptyForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (
      !form.title.trim() ||
      !form.date ||
      !form.startTime ||
      !form.endTime ||
      !form.manager.trim() ||
      !form.location.trim()
    ) {
      setError("모든 항목을 입력해주세요.");
      return;
    }

    if (form.startTime >= form.endTime) {
      setError("종료 시간은 시작 시간보다 늦어야 합니다.");
      return;
    }

    setError(null);
    onSubmit({
      title: form.title.trim(),
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      type: form.type,
      manager: form.manager.trim(),
      location: form.location.trim(),
    });
    setForm(emptyForm);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-black/10 dark:border-white/15 p-6 bg-white/50 dark:bg-white/5"
    >
      <div className="sm:col-span-2 flex flex-col gap-1">
        <label htmlFor="title" className="text-sm font-medium">
          일정 제목
        </label>
        <input
          id="title"
          type="text"
          value={form.title}
          onChange={handleChange("title")}
          placeholder="예: OO 브랜드 광고 촬영"
          className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="date" className="text-sm font-medium">
          날짜
        </label>
        <input
          id="date"
          type="date"
          value={form.date}
          onChange={handleChange("date")}
          className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="type" className="text-sm font-medium">
          유형
        </label>
        <select
          id="type"
          value={form.type}
          onChange={handleChange("type")}
          className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        >
          {SCHEDULE_TYPES.map((type) => (
            <option key={type} value={type} className="text-black">
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="startTime" className="text-sm font-medium">
          시작 시간
        </label>
        <input
          id="startTime"
          type="time"
          value={form.startTime}
          onChange={handleChange("startTime")}
          className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="endTime" className="text-sm font-medium">
          종료 시간
        </label>
        <input
          id="endTime"
          type="time"
          value={form.endTime}
          onChange={handleChange("endTime")}
          className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="manager" className="text-sm font-medium">
          담당자
        </label>
        <input
          id="manager"
          type="text"
          value={form.manager}
          onChange={handleChange("manager")}
          placeholder="예: 홍길동"
          className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="location" className="text-sm font-medium">
          장소
        </label>
        <input
          id="location"
          type="text"
          value={form.location}
          onChange={handleChange("location")}
          placeholder="예: 스튜디오 2관"
          className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && (
        <p className="sm:col-span-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="sm:col-span-2 flex justify-end">
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          일정 등록
        </button>
      </div>
    </form>
  );
}

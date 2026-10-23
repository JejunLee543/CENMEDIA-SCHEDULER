export const SCHEDULE_TYPES = ["촬영", "편집", "미팅", "납품"] as const;

export type ScheduleType = (typeof SCHEDULE_TYPES)[number];

export interface Schedule {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: ScheduleType;
  manager: string;
  location: string;
  createdAt: number;
}

export interface ScheduleNote {
  id: string;
  scheduleId: string;
  content: string;
  author: string | null;
  createdAt: number;
}

export interface ScheduleWithNotes extends Schedule {
  notes: ScheduleNote[];
}

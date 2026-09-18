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

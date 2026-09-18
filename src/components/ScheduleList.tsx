import type { Schedule, ScheduleType } from "@/types/schedule";

const TYPE_STYLES: Record<ScheduleType, string> = {
  촬영: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
  편집: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300",
  미팅: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  납품: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300",
};

function formatDate(date: string) {
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

export default function ScheduleList({ schedules }: { schedules: Schedule[] }) {
  if (schedules.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-black/15 dark:border-white/20 p-10 text-center text-sm text-black/50 dark:text-white/50">
        아직 등록된 일정이 없습니다.
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {schedules.map((schedule) => (
        <li
          key={schedule.id}
          className="rounded-xl border border-black/10 dark:border-white/15 p-4 bg-white/50 dark:bg-white/5"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold">{schedule.title}</h3>
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_STYLES[schedule.type]}`}
            >
              {schedule.type}
            </span>
          </div>
          <dl className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-black/70 dark:text-white/70">
            <div className="flex gap-1.5">
              <dt className="text-black/40 dark:text-white/40">날짜</dt>
              <dd>{formatDate(schedule.date)}</dd>
            </div>
            <div className="flex gap-1.5">
              <dt className="text-black/40 dark:text-white/40">시간</dt>
              <dd>
                {schedule.startTime} - {schedule.endTime}
              </dd>
            </div>
            <div className="flex gap-1.5">
              <dt className="text-black/40 dark:text-white/40">담당자</dt>
              <dd>{schedule.manager}</dd>
            </div>
            <div className="flex gap-1.5">
              <dt className="text-black/40 dark:text-white/40">장소</dt>
              <dd>{schedule.location}</dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  );
}

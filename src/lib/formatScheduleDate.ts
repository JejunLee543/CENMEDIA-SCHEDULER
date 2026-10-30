// "2026-11-01" -> "2026년 11월 1일 (일)". Parsed as local midnight so the
// weekday doesn't shift with the server's time zone.
export function formatScheduleDate(date: string) {
  const day = new Date(`${date}T00:00:00`);
  return (
    day.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" }) +
    ` (${day.toLocaleDateString("ko-KR", { weekday: "short" })})`
  );
}

import type { Schedule } from "@/types/schedule";
import { formatScheduleDate } from "./formatScheduleDate";

// Sends through Resend's HTTP API (resend.com/docs/api-reference/emails/send-email).
// Until a domain is verified in Resend, the sender must be onboarding@resend.dev
// and mail can only go to the address the Resend account was created with.
const apiKey = process.env.RESEND_API_KEY;
const from = process.env.RESEND_FROM || "CenMedia 스케줄러 <onboarding@resend.dev>";
const to = process.env.NOTIFY_EMAIL_TO;

// Emails a new-schedule notice to NOTIFY_EMAIL_TO. No-op unless RESEND_API_KEY
// and NOTIFY_EMAIL_TO are set; failures are logged, never thrown, so they
// can't affect schedule creation.
export async function notifyEmailScheduleCreated(schedule: Schedule) {
  if (!apiKey || !to) return;

  const when = `${formatScheduleDate(schedule.date)} ${schedule.startTime}–${schedule.endTime}`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // Resend drops repeats of the same key for 24h, so a retried request can't double-send
        "Idempotency-Key": `schedule-created/${schedule.id}`,
      },
      body: JSON.stringify({
        from,
        to,
        subject: `[일정 등록] [${schedule.type}] ${schedule.title}`,
        text:
          `새 일정이 등록되었습니다.\n\n` +
          `제목: ${schedule.title}\n` +
          `종류: ${schedule.type}\n` +
          `일시: ${when}\n` +
          `담당자: ${schedule.manager}\n` +
          `장소: ${schedule.location}\n`,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.error(`Resend email failed: ${res.status} ${await res.text()}`);
    }
  } catch (error) {
    console.error("Resend email error:", error);
  }
}

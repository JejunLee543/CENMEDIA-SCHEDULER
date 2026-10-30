import { createSign } from "node:crypto";
import type { Schedule } from "@/types/schedule";
import { formatScheduleDate } from "./formatScheduleDate";

// NAVER WORKS has no incoming webhooks; a bot posts to a message room via the
// Bot API, authenticated with a service-account JWT (RS256) exchanged for an
// access token. See developers.worksmobile.com/kr/docs/auth-jwt.
const TOKEN_URL = "https://auth.worksmobile.com/oauth2/v2.0/token";
const API_URL = "https://www.worksapis.com/v1.0";

const config = {
  clientId: process.env.NAVER_WORKS_CLIENT_ID,
  clientSecret: process.env.NAVER_WORKS_CLIENT_SECRET,
  serviceAccount: process.env.NAVER_WORKS_SERVICE_ACCOUNT,
  // .env files can't hold raw newlines in a single value, so allow "\n" escapes.
  privateKey: process.env.NAVER_WORKS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  botId: process.env.NAVER_WORKS_BOT_ID,
  channelId: process.env.NAVER_WORKS_CHANNEL_ID,
};

let cachedToken: { value: string; expiresAt: number } | null = null;

function base64url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

async function getAccessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;

  // iat/exp must be epoch seconds and at most 60 minutes apart
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({ iss: config.clientId, sub: config.serviceAccount, iat: now, exp: now + 3600 }),
  );
  const signature = createSign("RSA-SHA256")
    .update(`${header}.${claims}`)
    .sign(config.privateKey!);
  const assertion = `${header}.${claims}.${base64url(signature)}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
      client_id: config.clientId!,
      client_secret: config.clientSecret!,
      scope: "bot",
    }),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`token request failed: ${res.status} ${await res.text()}`);

  const { access_token, expires_in } = (await res.json()) as {
    access_token: string;
    expires_in: string | number;
  };
  // Refresh a minute early so a token never expires mid-request
  cachedToken = { value: access_token, expiresAt: Date.now() + (Number(expires_in) - 60) * 1000 };
  return access_token;
}

// Posts a new-schedule message to the configured NAVER WORKS room. No-op unless
// every NAVER_WORKS_* variable is set; failures are logged, never thrown, so
// they can't affect schedule creation.
export async function notifyNaverWorksScheduleCreated(schedule: Schedule) {
  if (Object.values(config).some((value) => !value)) return;

  const text =
    `📅 새 일정이 등록되었습니다\n` +
    `[${schedule.type}] ${schedule.title}\n` +
    `• 일시: ${formatScheduleDate(schedule.date)} ${schedule.startTime}–${schedule.endTime}\n` +
    `• 담당자: ${schedule.manager}\n` +
    `• 장소: ${schedule.location}`;

  try {
    const token = await getAccessToken();
    const res = await fetch(`${API_URL}/bots/${config.botId}/channels/${config.channelId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ content: { type: "text", text } }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      // A revoked or expired token shouldn't stick around for the next call
      if (res.status === 401) cachedToken = null;
      console.error(`NAVER WORKS message failed: ${res.status} ${await res.text()}`);
    }
  } catch (error) {
    console.error("NAVER WORKS message error:", error);
  }
}

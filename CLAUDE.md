# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — start the dev server (Next.js/Turbopack)
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — ESLint (flat config: `eslint-config-next` core-web-vitals + typescript rulesets)

There is no test suite configured in this repo.

## Architecture

Next.js 16 App Router + TypeScript + Tailwind CSS v4 + React 19. Path alias `@/*` maps to `src/*`.

A single-page client app backed by Next.js route handlers and Supabase Postgres via Drizzle ORM:

- `src/db/schema.ts` defines the tables: `schedules` and `schedule_notes` (many notes per schedule; `schedule_id` FK with `ON DELETE CASCADE`), plus Drizzle `relations` so `db.query.schedules.findMany({ with: { notes: true } })` works. `src/db/index.ts` passes the schema to `drizzle()`. Migrations live in `drizzle/` — after changing the schema, run `npx drizzle-kit generate` then `npx drizzle-kit migrate` (needs `DATABASE_URL` from `.env`).
- API routes: `src/app/api/schedules/route.ts` (GET returns `ScheduleWithNotes[]` sorted by `createdAt` desc with notes oldest-first; POST creates a schedule), `src/app/api/schedules/[id]/notes/route.ts` (POST creates a note; a missing schedule surfaces as an FK violation mapped to 404), and `src/app/api/schedules/[id]/notes/[noteId]/route.ts` (DELETE). The server generates `id` (`crypto.randomUUID()`) and `createdAt` (`Date.now()`).
- `src/app/page.tsx` is a `"use client"` component that loads schedules from the API and owns the `ScheduleWithNotes[]` state, updating it locally after each add/delete call.
- `src/types/schedule.ts` defines the domain model: the `Schedule`, `ScheduleNote`, and `ScheduleWithNotes` interfaces and the `SCHEDULE_TYPES` const tuple (`촬영`/`편집`/`미팅`/`납품` — shoot/edit/meeting/delivery). `ScheduleType` is derived from this tuple, and both the form's type `<select>` and the list's per-type badge colors are driven off it — adding a schedule type means updating `SCHEDULE_TYPES` and the corresponding style map in `ScheduleList.tsx`.
- `src/components/ScheduleForm.tsx` is a controlled form with client-side validation only (required fields, start time < end time). It calls the `onSubmit` prop with `Omit<Schedule, "id" | "createdAt">`; the parent (`page.tsx`) POSTs it and re-sorts the list by `createdAt` descending.
- `src/components/ScheduleList.tsx` renders schedule cards (dates via `toLocaleDateString("ko-KR", ...)`, expects schedules already sorted by the caller) and forwards `onAddNote`/`onDeleteNote` callbacks to `ScheduleNotes`.
- `src/components/ScheduleNotes.tsx` is a client component per schedule card: note list, add form, and delete buttons, with local pending state; the actual API calls live in `page.tsx`.

UI copy and domain fields are in Korean for a media-production company's internal scheduling use (담당자 = person in charge, 장소 = location).

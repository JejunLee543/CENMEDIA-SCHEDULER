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

This is currently a single-page client app with no backend and no persistence:

- `src/app/page.tsx` is a `"use client"` component that owns all schedule state via `useState`. Data lives only in memory and is lost on refresh — there is no API route, database, or localStorage layer.
- `src/types/schedule.ts` defines the domain model: the `Schedule` interface and the `SCHEDULE_TYPES` const tuple (`촬영`/`편집`/`미팅`/`납품` — shoot/edit/meeting/delivery). `ScheduleType` is derived from this tuple, and both the form's type `<select>` and the list's per-type badge colors are driven off it — adding a schedule type means updating `SCHEDULE_TYPES` and the corresponding style map in `ScheduleList.tsx`.
- `src/components/ScheduleForm.tsx` is a controlled form with client-side validation only (required fields, start time < end time). It calls the `onSubmit` prop with `Omit<Schedule, "id" | "createdAt">`; the parent (`page.tsx`) is responsible for generating `id` (`crypto.randomUUID()`) and `createdAt`, and for re-sorting the list by `createdAt` descending.
- `src/components/ScheduleList.tsx` is a pure display component; it formats dates with `toLocaleDateString("ko-KR", ...)` and expects schedules already sorted by the caller.

UI copy and domain fields are in Korean for a media-production company's internal scheduling use (담당자 = person in charge, 장소 = location).

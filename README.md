# Smart Weekly Planner

An AI-assisted weekly planner: tell it what you need to do — by typing or
speaking — and it slots the task into your week around your fixed
commitments, re-planning as new or more urgent tasks come in and explaining
every placement it makes rather than acting as a black box.

**Live demo:** https://smart-planner-api.vercel.app
*(the backend is on Render's free tier, which sleeps after 15 minutes of
inactivity — the first request after a while can take 30-60s to wake up)*

## What it does

1. Enter your fixed weekly schedule once (classes, work, etc.) on a
   FullCalendar weekly view.
2. Add a task by typing or speaking — "finish the calc problem set, due
   Thursday."
3. An LLM call parses that into structured data (name, deadline, estimated
   duration, priority) and persists it.
4. A second LLM call looks at your fixed schedule and every other active
   task, then proposes where the new task — and, if needed, any task it
   displaces — should go, returning a short human-readable reason for each
   placement.
5. The calendar updates. You can drag anything to a different time as a
   manual override at any point; overrides get logged with a reason too.

## Tech stack

- **Frontend:** React, TypeScript, Vite, FullCalendar, TanStack Query,
  `vite-plugin-pwa` (installable PWA)
- **Backend:** Node, Express, TypeScript, Prisma
- **Database:** PostgreSQL, hosted on [Neon](https://neon.tech) (serverless)
- **AI:** Google Gemini (`gemini-3.6-flash`) via `@google/genai`, using
  schema-constrained structured JSON output rather than free-form prompting
- **Voice input:** browser-native Web Speech API — no extra backend
- **Deployment:** Vercel (frontend), Render (backend)

## Architecture notes

A few decisions worth calling out, since they were deliberate rather than
defaults:

- **Monorepo (npm workspaces):** `apps/web`, `apps/api`, and
  `packages/shared` — a shared `zod` schema package so the frontend and
  backend validate data against the exact same contract instead of drifting
  apart.
- **Vendor-agnostic LLM layer:** all model calls go through an
  `LLMProvider` interface (`apps/api/src/llm/`). Swapping providers later
  is writing one adapter class and flipping an env var, not touching route
  handlers.
- **Minimal-diff scheduling:** the scheduling call is explicitly asked to
  return only the tasks whose placement is new or has to change — never a
  full replan — so an unrelated task doesn't jump around every time a new
  one is added.
- **Explainability as a first-class concept:** every placement, AI-proposed
  or manually dragged, is written to a `Placement` log with a reason, not
  just overwritten onto the task. The UI reads from that log rather than
  re-deriving an explanation after the fact.
- **Nullable deadlines:** a task with no stated deadline is treated as
  flexible/low-priority, not as an error case.
- **Structured output over free-form parsing:** both LLM calls force a
  JSON schema via Gemini's `responseSchema`, and the result is re-validated
  against the shared `zod` schema server-side before it's trusted — a
  schema-constrained response is still model output, not pre-validated data.
- **Explicit local-timezone handling:** every LLM call is given the current
  time with an explicit UTC offset rather than raw UTC — found as a real
  bug during development, where "8am" was silently being anchored to UTC
  instead of the user's local time.

## Project structure

```
apps/
  web/            React + Vite frontend (PWA)
  api/            Express backend
packages/
  shared/         Zod schemas/types shared by both apps
```

## Running locally

```bash
npm install
cp apps/api/.env.example apps/api/.env   # fill in Neon connection strings + a Gemini API key
npm run dev                              # runs web (5173) and api (4000) together
```

`apps/api/.env` needs:
- `DATABASE_URL` / `DIRECT_URL` — a free [Neon](https://neon.tech) Postgres project (pooled and direct connection strings respectively)
- `GEMINI_API_KEY` — a free key from [Google AI Studio](https://aistudio.google.com/apikey)

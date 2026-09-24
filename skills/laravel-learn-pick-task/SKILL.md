---
name: laravel-learn-pick-task
description: Scan a Laravel app and offer the owner 3 real tasks to learn from, then write the TICKET.md for the one they pick. Use when the owner is learning Laravel by building their own app and asks "what should I learn next", "give me a task", "next lesson", "pick a ticket", "what is left to build", or starts a new lesson. Reads learn/learn.config.json and runs a read-only scanner first. Do not use to write lesson code (laravel-learn-write-lesson) or to review the owner's code (laravel-learn-coach).
license: MIT
metadata:
  author: thannsopheakboth
  version: "1.0.0"
---

# Laravel Learn: Pick a Task

The owner learns Laravel by building a real app. They type the code. You teach.
This skill finds what is not built yet, and offers 3 tasks to learn from.

**Facts first.** Do not suggest a task until the scan JSON exists.
Do not open source files to guess what is built. The scanner does that.

Read these before you write anything to the owner:

- [references/shared/hard-rules.md](references/shared/hard-rules.md) — who writes what. Never break these.
- [references/shared/voice.md](references/shared/voice.md) — plain English. Short sentences.

## How It Works

1. Check for `learn/learn.config.json` at the repo root.
   - Missing: follow [references/first-run.md](references/first-run.md). Stop until it exists.
2. Run the scanner. Save JSON to the scratchpad, not the repo.
3. Stop on blockers (table below).
4. Read the scan JSON and the `buildOrderDoc` section on build order. Nothing else yet.
5. Build the candidate list. Rank it with [references/scoring.md](references/scoring.md).
6. Offer 3. Mark one as **next in build order**. Wait for the owner to pick.
7. Write `learn/NN-slug/TICKET.md` from [references/ticket-template.md](references/ticket-template.md), with `status: proposed`.
8. Hand off. Tell the owner: say **"write the lesson"** to go on.

## Usage

```bash
node <this-skill-dir>/scripts/scan-project.mjs <repo-root> > <scratchpad>/scan.json
```

**Arguments:**
- `<repo-root>` — the folder with `learn/` (defaults to the current folder)
- `--no-artisan` — skip `php artisan route:list --json` and read `routes/*.php` by regex. Use when PHP or the database is not up.

The scanner is read-only. `route:list` does not change anything.
Logs go to stderr. JSON goes to stdout.

**Examples:**

```bash
# Monorepo, app in apps/api
node ~/.claude/skills/laravel-learn-pick-task/scripts/scan-project.mjs C:/Users/me/Desktop/xpress-social > "$SCRATCH/scan.json"

# PHP not running
node ~/.claude/skills/laravel-learn-pick-task/scripts/scan-project.mjs . --no-artisan > "$SCRATCH/scan.json"
```

## Output

Main keys (full list in the script):

| Key | What it holds |
|---|---|
| `blockers` | problems to fix first |
| `modules` | module name, path, enabled |
| `routes` | method, uri, action, `stub` (a closure, not a controller) |
| `tables` | tables made by migrations |
| `classes` | per module: models, controllers, requests, resources, services, repositories, events ... |
| `tests` | per module: test files and `it(`/`test(` calls |
| `buildOrder` | numbered list under the "Build order" heading of `buildOrderDoc` |
| `endpoints.done` / `.stubs` / `.missing` | doc endpoints split by what the routes show |
| `lessons` | `learn/NN-*` folders with `status` from `TICKET.md` |
| `summary.nextLessonNumber` | number for the new lesson folder |

Short example (xpress-social, 2026-09-24):

```json
{
  "endpoints": {
    "done":  [{ "method": "POST", "path": "/api/v1/auth/register" }],
    "stubs": [{ "method": "GET",  "path": "/api/v1/me", "route": "api/v1/me" }],
    "missing": [{ "method": "POST", "path": "/api/v1/auth/login" }]
  },
  "summary": { "endpointsDone": 2, "endpointsStub": 1, "endpointsMissing": 42, "nextLessonNumber": 4 }
}
```

A **stub** is a route that exists but only returns a closure, like `fn () => request()->user()`.
It counts as not built. It is often the best next task: small, and the route is already there.

## Stop on blockers

| Blocker | Do this |
|---|---|
| `no_config` | Follow [references/first-run.md](references/first-run.md). |
| `no_artisan` | `appPath` is wrong. Ask the owner where `artisan` is. Fix the config. |
| `no_build_order_doc` | Ask the owner for the scope doc. Or offer to draft one with them first. |
| `routes_from_regex` | Fine to go on. Say route prefixes may be missed. Suggest starting the database and PHP. |

## Present Results to User

Use this shape. Plain words. Real paths.

```markdown
## Where the app is

- Built: 2 endpoints (`POST /api/v1/auth/register`, `GET /sanctum/csrf-cookie`). 1 stub (`GET /api/v1/me`).
- Missing: 42 endpoints. Build order step 1 "Auth + `me`" is not finished.
- Lessons: 3 done. None in progress.

## Pick one

| # | Task | Size | You learn |
|---|---|---|---|
| 1 **next** | `GET /api/v1/me` — replace the stub | S | `auth:sanctum`, `$request->user()`, reuse `MeResource` |
| 2 | `POST /api/v1/auth/login` | S | `Auth::attempt`, session cookie, rate limit `auth-login` |
| 3 | `POST /api/v1/auth/logout` | S | `Auth::guard('web')->logout()`, session invalidate |

Why 1 is next: build order step 1 is "Auth + `me`". The route exists. You already built `MeResource` in lesson 02.

Say the number. I will write `learn/04-me-endpoint/TICKET.md`.
```

Rules for the offer:

- Exactly 3 unless fewer exist.
- If a lesson is `in-progress`, the first option is **finish lesson NN**. Then 2 new ones.
- Each option is one small slice: one endpoint, or one table. Never "all of posts".
- "You learn" names real Laravel features, not vague ideas.

## After the Owner Picks

1. Folder: `learn/<nextLessonNumber padded to 2>-<kebab-slug>/`.
2. Write `TICKET.md` from the template. `status: proposed`.
3. Open questions from the project docs that touch this task: propose an answer in "Decisions". The owner confirms.
4. Do not write `ref/`, README, or GUIDE here. That is `laravel-learn-write-lesson`.
5. End with: "Read the ticket. Change any decision you do not like. Then say **write the lesson**."

## Troubleshooting

| Problem | Fix |
|---|---|
| `route:list failed` in stderr | Database or `.env` not ready. Rerun with `--no-artisan`. |
| All endpoints show missing | The doc paths and route uris differ in prefix. Compare one pair by hand. Doc says `/api/v1/me`, route says `api/v1/me`: that matches. Doc says `/me`: fix the doc or add the prefix. |
| Lessons show `status: unknown` | Old lesson with no frontmatter. Ask the owner the status. Add frontmatter to its `TICKET.md`. |
| `bad JSON in learn.config.json` | Trailing comma or comment. JSON allows neither. |

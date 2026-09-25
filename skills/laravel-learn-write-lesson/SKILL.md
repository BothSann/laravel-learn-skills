---
name: laravel-learn-write-lesson
description: Turn a picked Laravel learning ticket into a full lesson - working reference code in learn/NN-slug/ref/ that follows the project rules and Laravel Boost best practices (laravel-best-practices, testing-best-practices), proven in a scratch copy with SQLite, plus README.md, GUIDE.md, and answers.md - then give the owner step 1 only. Use when the owner says "write the lesson", "build lesson 04", "make the ref code", "the ticket is ok, go on", or confirms the decisions in a TICKET.md with status proposed. Never writes into the owner's app code. Do not use to pick a task (laravel-learn-pick-task) or to review typed code (laravel-learn-coach).
license: MIT
metadata:
  author: thannsopheakboth
  version: "1.0.0"
---

# Laravel Learn: Write the Lesson

The owner picked a task. `TICKET.md` exists. Now build the lesson they will follow.
You write the full answer in `ref/`, prove it runs, then teach it one step at a time.

Read these first:

- [references/shared/hard-rules.md](references/shared/hard-rules.md) — who writes what
- [references/shared/layout.md](references/shared/layout.md) — lesson files and status
- [references/shared/voice.md](references/shared/voice.md) — plain English
- [references/shared/project-config.md](references/shared/project-config.md) — config fields
- [references/shared/code-quality.md](references/shared/code-quality.md) — **which rules the code must follow, and in what order.** The most important file for this skill.

## How It Works

1. **Read the ticket.** `learn/NN-slug/TICKET.md`. If `status` is not `proposed`, ask why before going on.
2. **Confirm decisions.** Show the "Decisions" table. Wait for "ok" or changes. Write the answers into the ticket.
3. **Load the rules.** Follow "Where the rules come from" in `code-quality.md`:
   - Run the scanner from `laravel-learn-pick-task` (or reuse its JSON from this session). Take the paths from `qualitySources`.
   - Read **every** project rule file (`qualitySources.rules`) and the Boost guideline files.
   - Read one sibling file of each layer you will touch. Example: the current `AuthController` before a new controller.
   - Map the ticket to Boost rule files with the table in `code-quality.md`. Read only those.
   - Check version-sensitive Laravel calls with the Boost `search-docs` MCP tool when `laravelBoostMcp` is true.
4. **Write `ref/`.** The complete working code. Same paths as the real app. See "ref rules" below.
5. **Prove it** in a scratch copy. Follow [references/scratch-run.md](references/scratch-run.md). Every criterion. Never the owner's database.
6. **Rule pass.** Read the diff again against every rule file from step 3. Fix, then prove again. See "Rule pass" in `code-quality.md`.
7. **Write the lesson files:**
   - `README.md` from [references/readme-template.md](references/readme-template.md)
   - `GUIDE.md` from [references/guide-template.md](references/guide-template.md), with the "Rules this lesson follows" table
   - `answers.md` from [references/answers-template.md](references/answers-template.md)
8. **Set status.** `TICKET.md` frontmatter `status: in-progress`.
9. **Give step 1 only.** Then stop and wait for "done", "stuck", or "check".

## `ref/` rules

- Mirror real paths: `learn/04-me-endpoint/ref/apps/api/asgard/Api/src/Http/Controllers/V1/MeController.php`.
- Follow every project rule, then Boost, in the order in `code-quality.md`. The project rule wins a clash. Write each clash down in the GUIDE.
- Code a senior Laravel dev would merge. Not a short demo. The owner copies what they see.
- Tests follow the `testing-best-practices` skill: one test per acceptance criterion and per decision in the code.
- Use the same generators the owner will use. The guide tells them the exact `generator` command. `ref/` shows the file after they edit it.
- Only the files this ticket needs. No extras "for later".
- Migrations: write them in `ref/` too. After the owner confirms, the agent writes the same migration in the app (standing exception `migrations`).
- Tests: put them in `ref/` so the scratch run proves the code. Do not tell the owner to type them. They are written in the app only when the owner asks.
- Add PHPDoc in `ref/`. The owner does not type docblocks. The agent adds them to the owner's file later.

## Step design

Break the work into steps the owner can finish in 5–15 minutes each.

| Step kind       | Example                                                              |
| --------------- | -------------------------------------------------------------------- |
| Read and decide | Step 0: read the ticket, confirm decisions                           |
| Branch          | `git fetch origin` then `git switch -c feat/me-endpoint origin/main` |
| Generate        | `php artisan module:make-controller MeController Api`                |
| Type one file   | the controller method                                                |
| Wire it         | route line in `routes/api/v1.php`                                    |
| Prove           | curl for criterion 1                                                 |
| Ship            | gates, commits, PR                                                   |

- One file or one wire-up per step.
- Each step ends with a **check** the owner runs and sees: a `tinker --execute` line, a curl, or `route:list --path=...`.
- Mark who does each step: "you type", "you run", "agent writes" (standing exceptions only).

## Present Results to User

After writing everything, say:

```markdown
## Lesson 04 is ready

- Ticket: `learn/04-me-endpoint/TICKET.md` (decisions saved)
- Ref code: 3 files in `learn/04-me-endpoint/ref/`
- Proven in a scratch copy (SQLite): 4 of 4 criteria. Pint 0. Larastan 0.
- Rules read: 10 project rules, Boost `routing.md`, `validation.md`, `security.md`. Clashes: none.
- Not proven: nothing. (Or: "criterion 3 needs Redis, not run.")

## Step 1: branch

<the step, from GUIDE.md, with the command in the owner's shell>

Check: `git status` says "nothing to commit".

Say **done**, **stuck**, or **check**.
```

## Rules for giving steps

- One step per message. Never paste the whole guide.
- Commands in the owner's `shell` from config.
- Do not paste `ref/` code into chat. Point to the guide step. The guide shows the code to type.
- Say plainly what was not run.

## Troubleshooting

| Problem                                           | Fix                                                                                     |
| ------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Scratch copy fails on `composer install`          | Copy `vendor/` too, or run with `--no-scripts`. See scratch-run.md.                     |
| A criterion needs Redis, S3, mail                 | Use the fake: `Storage::fake()`, `Mail::fake()`, `CACHE_STORE=array`. Say it was faked. |
| Project rule and ticket disagree                  | Stop. Ask the owner. Fix the ticket or the rule first.                                  |
| Owner changed a decision after `ref/` was written | Update `ref/`, run the scratch proof again, update GUIDE and answers.                   |

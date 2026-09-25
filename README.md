# laravel-learn-skills

Learn Laravel by building your own app. You type the code. The AI agent is your teacher and reviewer.

Three agent skills, for Claude Code and other agents that read `SKILL.md`.

## How a lesson goes

| You say | Skill | What happens |
|---|---|---|
| "what should I learn next?" | `laravel-learn-pick-task` | Scans your app. Offers 3 tasks. You pick. It writes `TICKET.md`. |
| "write the lesson" | `laravel-learn-write-lesson` | Writes the full answer in `ref/`. Proves it in a scratch copy. Writes the guide. Gives step 1. |
| "done" / "stuck" / "check" | `laravel-learn-coach` | Next step, help, or a review. |
| "ship it" | `laravel-learn-coach` | Gates, curl proofs, commits, PR text. Then back to the top. |

Example, from a real app (xpress-social, 2026-09-24):

- Scan: 45 endpoints in `docs/api-scope.md`. 2 done (`POST /api/v1/auth/register`, `GET /sanctum/csrf-cookie`). 1 stub (`GET /api/v1/me`). 42 missing.
- Offer: 1. `GET /api/v1/me` (next), 2. login, 3. media upload.

## Rules the agent keeps

- It never types your app code. Only `learn/` files, plus what you allow in config (migrations, PHPDoc, Scribe attributes).
- It never runs commands that change your app or database. It gives you the command.
- It proves its own code in a copy of your app, on SQLite. Never your database.
- Its code follows your project rules first (for example the CTO's `.claude/rules/`), then Laravel Boost's `laravel-best-practices` and `testing-best-practices` skills. Each lesson's GUIDE shows which rule drove each choice. Details: [shared/code-quality.md](shared/code-quality.md).

Full list: [shared/hard-rules.md](shared/hard-rules.md).

## Install

Needs Node 20+.

```bash
git clone <this repo> laravel-learn-skills
cd laravel-learn-skills
npm run install-local        # links the 3 skills into ~/.claude/skills
```

Or copy one folder by hand: `cp -r skills/laravel-learn-coach ~/.claude/skills/`.

## First run in your app

1. Open your Laravel repo in Claude Code.
2. Say "what should I learn next?".
3. The agent asks a few facts and writes `learn/learn.config.json`. Fields: [shared/project-config.md](shared/project-config.md).
4. Make sure `learn/` is git-ignored. Personal: add it to `.git/info/exclude`.

Your scope doc needs endpoint tables like this, and a "Build order" list:

```markdown
| Method | Path | Auth | Does |
|---|---|---|---|
| GET | `/api/v1/me` | user | Current user. |

## Build order

1. Auth + `me`
2. Media upload
```

## Work on the skills

```bash
npm run sync       # copy shared/ into each skill
npm run validate   # check SKILL.md rules, links, shared copies
npm test           # scanner tests on test/fixtures/tiny-laravel
```

See [AGENTS.md](AGENTS.md).

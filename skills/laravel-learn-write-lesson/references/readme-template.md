# README.md template

Short. The owner reads it first. Real example: `learn/03-base-repository/README.md`.

```markdown
# Lesson 04: me endpoint

Read `TICKET.md` first. It is the job.
`GUIDE.md` has the what, why, and how for each step.
`ref/` has the full working code. Look at it after you try.
`check-yourself.md` is the quiz. Each answer is under its question.

## Goal

- Replace the `GET /api/v1/me` stub with a real controller.
- Answer through `MeResource`, so the shape matches register.

## New words

| Word | Plain meaning |
|---|---|
| Guard | The part of Laravel that says who is logged in. `sanctum` is ours. |
| Middleware | Code that runs before the controller. `auth:sanctum` stops logged-out calls with 401. |

## Steps

| Step | Work | Who |
|---|---|---|
| 0 | Read the ticket. Confirm the decisions. | you |
| 1 | Branch `feat/me-endpoint` from `origin/main` | you run |
| 2 | `php artisan module:make-controller MeController Api` | you run |
| 3 | `MeController::show()` | you type |
| 4 | Route line | you type |
| 5 | Curl: logged in 200, logged out 401 | you run |
| 6 | Gates and PR | you run |

After each PHP file, the agent adds the PHPDoc blocks and reviews on "check".

## Where you are now

- `ref/` is done and proven in a scratch copy (SQLite).
- Next: step 0.
```

## Rules

- "New words": only words new to this owner. Check past lessons' README "New words" tables.
- Explain each layer the first time it shows up in any lesson: Controller, Service, Repository, Resource, Form Request, Event.
- The quiz lives in `check-yourself.md`, not in the README. See `check-yourself-template.md`.
- "Where you are now": update it when the owner finishes a step.

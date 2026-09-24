# TICKET.md template

Copy this shape. Fill every part. Keep words plain.
Real example: `learn/03-base-repository/TICKET.md` in xpress-social.

```markdown
---
id: XS-5
status: proposed
---

# Ticket XS-5: Me endpoint

## Story

As a logged-in user, I want to see my own account, so that the app can show my name and settings.

## Why now

- Build order step 1 is "Auth + `me`". Register is done. `me` is a stub.
- The stub is `fn () => request()->user()`. It skips `MeResource`, so the shape is wrong.

## Scope

In:
- `GET /api/v1/me` with `auth:sanctum`.
- Controller method, answer through `MeResource`.

Out (later):
- `PATCH /api/v1/me`. Ticket XS-6.
- Unread count. Needs notifications.

## Request and answer

`GET /api/v1/me` with the session cookie.

200:

    { "data": { "id": 1, "username": "dara", "email": "dara@example.com", "is_private": false } }

401 (no session):

    { "message": "Unauthenticated.", "code": "UNAUTHENTICATED", "errors": null, "request_id": "01J..." }

## Acceptance criteria

1. Logged in: `GET /api/v1/me` gives 200 and the shape above.
2. Logged out: gives 401 with `code` `UNAUTHENTICATED`.
3. `php artisan route:list --path=me` shows a controller, not `Closure`.
4. Gates pass: every command in `gates` from the config.

## Decisions

Proposed by the agent. The owner confirms before the lesson is written.

| Question | Proposal | Why |
|---|---|---|
| New controller or `AuthController@me`? | `MeController` | Me grows (PATCH, password). Keep auth small. |

## Rare cases to think about

- The user was banned after login. Proposal: 403 `ACCOUNT_BANNED`. Confirm.

## Definition of done

- All criteria proven with one curl each. Output pasted in the PR.
- Docs the change touches are updated in the same PR.
- PR open against the base branch. Small commits.
```

## Rules

- `id`: `ticketPrefix` from config + next free number. Look at other tickets' ids. No prefix in config: use `L-<NN>`.
- Criteria are things a curl or `tinker --execute` can prove. Not "code is clean".
- Every criterion has a real number or string to check.
- Decisions: only real open questions. Take them from the project docs' open questions when they exist.

# "ship it": gates, proofs, commits, PR

The owner runs every command here. You give them in order and read the output.

## 1. Prove each acceptance criterion

One curl (or `tinker --execute`) per criterion from `TICKET.md`.
Owner runs it. Owner pastes the output. You compare with the ticket.

PowerShell example (from `shell` in config):

```powershell
curl.exe -s -i "http://localhost:8000/api/v1/me" -H "Accept: application/json"
```

Record the result in a table. It goes in the PR body:

```markdown
| # | Criterion | Command | Result |
|---|---|---|---|
| 1 | Logged in gives 200 | `curl.exe ... /me` with cookie | 200, `data.username = "dara"` |
| 2 | Logged out gives 401 | `curl.exe ... /me` | 401, `code = "UNAUTHENTICATED"` |
```

Tests are not required unless the owner asked for them in this lesson.

## 2. Gates

Every command in `gates` from config, from `appPath`. Example:

```bash
vendor/bin/pint --dirty
vendor/bin/phpstan analyse
php artisan scribe:generate
```

All must pass. A failure: go to "stuck" or "check" for that file.

## 3. Docs

Update the docs the change touches, in the same PR.
Example: an endpoint moved from "planned" to "done" in the scope doc, or a rule file section "Where we are today".

## 4. Commits

- One commit per small piece. Shape from `commitStyle`. Example: `feat(api): add MeController for GET /me`.
- Give exact commands. Owner runs them:

```bash
git add apps/api/asgard/Api/src/Http/Controllers/V1/MeController.php
git commit -m "feat(api): add MeController for GET /me"
```

- Never `git add -A`. `learn/` must not be staged. Check with `git status` before commit.

## 5. PR

Owner pushes and opens the PR against `baseBranch`. You write the body:

```markdown
## Summary

- Replace the `GET /api/v1/me` stub with `MeController@show`.
- Answer through `MeResource`.

## Scope

In: `GET /api/v1/me`. Out: `PATCH /api/v1/me` (XS-6).

## Acceptance criteria

<the table from step 1>

## Gates

Pint: pass. Larastan: 0 errors. Scribe: generated.
```

## 6. Close the lesson

- `TICKET.md` frontmatter: `status: done`.
- README "Where you are now": "Done. PR #N."
- Offer the next task: say **"what should I learn next"** (runs `laravel-learn-pick-task`).

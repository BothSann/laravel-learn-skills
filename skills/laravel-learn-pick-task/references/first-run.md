# First run: make `learn/learn.config.json`

Do this once per project. The field list is in [shared/project-config.md](shared/project-config.md).

## 1. Find what you can, without asking

Read-only checks:

| Field | How to find it |
|---|---|
| `appPath` | Folder that holds `artisan`. Check `.`, `apps/api`, `api`, `backend`. |
| `modulesPath` | `modules.json` next to module folders. Or `nwidart/laravel-modules` in `composer.json` and its `paths.modules` config. |
| `buildOrderDoc` | A doc in `docs/` with a table of `GET` / `POST` rows. Grep `\| GET \|`. |
| `rulesDirs` | `.claude/rules/` in the app or repo root. |
| `generator` | `module:make-` if modules are used. Else `make:`. |
| `baseBranch` | `git symbolic-ref refs/remotes/origin/HEAD` |
| `gates` | `pint`, `phpstan`, `scribe` in `composer.json` `require-dev` |
| `shell` | Windows: `powershell`. Else `bash`. |

## 2. Ask the owner the rest

Ask in one message. Offer your guess as the default.

Example:

```markdown
I need a few facts. My guesses are in bold. Say "ok", or fix the ones that are wrong.

1. App folder: **apps/api**
2. Scope doc with the endpoint list: **docs/api-scope.md**
3. Start branches from: **origin/main**
4. Your shell: **powershell**
5. Local API url: **http://localhost:8000/api/v1**
6. Things I may always write in `apps/` for you: **migrations, PHPDoc blocks, Scribe attributes**
```

## 3. Write the file

- Path: `learn/learn.config.json`.
- Check `learn/` is git-ignored: `git check-ignore learn/`. If not, tell the owner to add `learn/` to `.git/info/exclude`. Do not edit the shared `.gitignore`.
- Then run the scanner again.

## No scope doc?

The scanner needs a list of endpoints to find gaps.

- Offer to draft `docs/api-scope.md` with the owner: a table per area with `Method | Path | Auth | Does`, and a "Build order" numbered list.
- The owner owns the doc. Draft it, show it, let them change it.

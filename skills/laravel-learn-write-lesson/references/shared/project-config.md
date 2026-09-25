<!-- Copied from shared/project-config.md by scripts/sync-shared.mjs. Edit that file, not this one. -->

# Project config: `learn/learn.config.json`

Project facts live here, not in the skills. Same skills, any Laravel app.
`learn/` is git-ignored, so the config stays personal.

## Fields

| Field | Required | Means | Example |
|---|---|---|---|
| `appPath` | yes | folder with `artisan`, relative to repo root | `apps/api` or `.` |
| `modulesPath` | no | folder of modules, if the app uses modules | `apps/api/asgard` |
| `buildOrderDoc` | yes | doc with the endpoint list and build order | `docs/api-scope.md` |
| `docs` | no | more docs to read when writing a lesson | `["docs/architecture.md"]` |
| `rulesDirs` | no | project coding rules (team lead or CTO). Win over everything else. | `["apps/api/.claude/rules"]` |
| `skillsDirs` | no | folders with Laravel Boost skills (`laravel-best-practices`, `testing-best-practices`) | `["apps/api/.claude/skills"]` |
| `guidelines` | no | Boost guideline files | `["apps/api/CLAUDE.md"]` |
| `generator` | no | command prefix to make new files | `php artisan module:make-` |
| `baseBranch` | yes | branch to start from | `origin/main` |
| `commitStyle` | no | example commit message | `feat(account): add me endpoint` |
| `ticketPrefix` | no | ticket id prefix | `XS-` |
| `shell` | yes | the owner's shell for commands | `powershell` or `bash` |
| `baseUrl` | yes | local API url for curl | `http://localhost:8000/api/v1` |
| `gates` | no | commands that must pass before a PR | see below |
| `standingExceptions` | no | what the agent may always write in the app | `["phpdoc", "scribe", "migrations"]` |

`standingExceptions` values:

| Value | Agent may write |
|---|---|
| `phpdoc` | PHPDoc blocks in the owner's files, after their code works |
| `scribe` | Scribe attributes on controllers |
| `migrations` | migration files. Owner still runs `migrate`. |

If `rulesDirs`, `skillsDirs`, or `guidelines` is missing, the scanner looks in the default places:
`<appPath>/.claude/rules`, `<appPath>/.claude/skills`, `<appPath>/.ai/rules`, `<appPath>/CLAUDE.md`, `<appPath>/AGENTS.md`.
How the agent uses them: [code-quality.md](code-quality.md).

## Full example (xpress-social)

```json
{
  "appPath": "apps/api",
  "modulesPath": "apps/api/asgard",
  "buildOrderDoc": "docs/api-scope.md",
  "docs": ["docs/architecture.md", "docs/prd.md", "docs/domain.md"],
  "rulesDirs": ["apps/api/.claude/rules"],
  "skillsDirs": ["apps/api/.claude/skills"],
  "guidelines": ["apps/api/CLAUDE.md"],
  "generator": "php artisan module:make-",
  "baseBranch": "origin/main",
  "commitStyle": "feat(account): add me endpoint",
  "ticketPrefix": "XS-",
  "shell": "powershell",
  "baseUrl": "http://localhost:8000/api/v1",
  "gates": [
    "vendor/bin/pint --dirty",
    "vendor/bin/phpstan analyse",
    "php artisan scribe:generate"
  ],
  "standingExceptions": ["phpdoc", "scribe", "migrations"]
}
```

## Plain Laravel app example

No modules. App at the repo root.

```json
{
  "appPath": ".",
  "buildOrderDoc": "docs/scope.md",
  "baseBranch": "origin/main",
  "shell": "bash",
  "baseUrl": "http://localhost:8000/api",
  "gates": ["vendor/bin/pint --dirty"]
}
```

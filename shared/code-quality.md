# Code quality: which rules the code must follow

`ref/` code is the answer key the owner learns from. It must be code a senior Laravel dev would merge.
The same rules are used to review the owner's code on "check".

## Where the rules come from

Read them in this order. **When two disagree, the higher one wins.**

| # | Source | Where | Example |
|---|---|---|---|
| 1 | Project rules (the team lead's or CTO's) | every file in `rulesDirs` | `apps/api/.claude/rules/architecture.md`: "Controller -> Service -> Repository" |
| 2 | What the app already does | sibling files of the layer you write | the current `AuthController` before a new controller |
| 3 | Laravel Boost guidelines | files in `guidelines` | `apps/api/CLAUDE.md` inside `<laravel-boost-guidelines>` |
| 4 | Laravel Boost skills | `laravel-best-practices`, `testing-best-practices` in `skillsDirs` | `rules/validation.md`: "Use Form Requests" |
| 5 | Laravel docs for the installed version | Boost MCP tool `search-docs`, if it is running | "Laravel 13 `Auth::attempt` signature" |

Why this order:

- The project rules are hard-won team decisions. Boost itself says: "the best choice is the one the codebase already uses".
- Boost skills are general Laravel defaults. They fill the gaps the project rules leave.
- `search-docs` gives the right API for the installed version. Memory can be one version old.

The scan JSON lists what exists under `qualitySources`. Use those paths. Do not guess.
If a source is missing, skip it and say so once.

## Map each piece of work to the Boost rule files

Read only the rows the lesson touches. Paths are inside the `laravel-best-practices` skill folder.

| The lesson writes | Boost rule files |
|---|---|
| Route, controller, middleware, Resource | `rules/routing.md` |
| Form Request, validation | `rules/validation.md` |
| Model, relation, scope, cast | `rules/eloquent.md` |
| Migration, index, foreign key | `rules/migrations.md`, `rules/db-performance.md` |
| Repository query, list, paging | `rules/db-performance.md`, `rules/advanced-queries.md` |
| Service, action, class layout | `rules/architecture.md`, `rules/style.md` |
| Login, auth, policies, uploads, secrets | `rules/security.md` |
| Exceptions, error answers | `rules/error-handling.md` |
| Events, listeners, notifications | `rules/events-notifications.md` |
| Jobs, queues | `rules/queue-jobs.md` |
| Cache | `rules/caching.md` |
| Calls to other APIs | `rules/http-client.md` |
| Mail | `rules/mail.md` |
| Config, `.env` | `rules/config.md` |
| Tests | the `testing-best-practices` skill: its `SKILL.md`, then the rule files it points to |

Example: a login endpoint touches routing, validation, security, error handling.
Read those 4 files. Skip the other 14.

## Rule pass: before code counts as done

After the code runs, read the diff again against every rule file you mapped.

1. For each file: does it break a project rule? A Boost rule?
2. Fix it in `ref/`. Run the scratch proof again.
3. If a Boost rule and a project rule disagree, keep the project rule. Write the clash down for the owner.

## Show the owner where each choice comes from

The owner learns the **why**, not only the code.
`GUIDE.md` gets a table near the top:

```markdown
## Rules this lesson follows

| Choice in the code | Rule | Source |
|---|---|---|
| `AuthController::login()` only calls `AccountService::login()` | Controllers stay HTTP-only | project: `architecture.md` "API read/write shape" |
| Input checked in `LoginRequest`, not the controller | Use Form Requests | Boost: `laravel-best-practices/rules/validation.md` |
| `AccountService::login()` gets `$request->validated()`, not `$request->all()` | Use only validated data | Boost: `laravel-best-practices/rules/validation.md` "Use Only Intended Validated Data" |
| `throttle:auth-login` on the route | Rate limit login | Boost: `laravel-best-practices/rules/security.md` "Rate Limit Sensitive Endpoints" |
```

- Name the real rule file and heading.
- One row per choice the owner might ask "why?" about.

## In a review ("check")

Every finding in "Breaks" and "Style" names its source:

```markdown
| `AuthController.php:31` | `$this->accountService->login($request->all())` | Fields the rules never checked reach the service | Boost `validation.md` "Use Only Intended Validated Data" |
```

No source for a finding? Then it is taste, not a rule. Say it is optional, or leave it out.

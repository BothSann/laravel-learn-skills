# "check" and "check and fix"

## "check": read-only review

1. Read the owner's files for this step or lesson. Use `git diff` against the base branch to find them.
2. Run read-only checks: `route:list`, `tinker --execute`, a curl to their local server.
3. Compare with the ticket's criteria, then the rules in the order in [shared/code-quality.md](shared/code-quality.md): project rules first, then Boost `laravel-best-practices` rule files mapped to the layers the owner touched. For tests, `testing-best-practices`. `ref/` is a guide, not the answer key.
4. Report in this order:

| Order | Section | What goes in it |
|---|---|---|
| 1 | Right | What works and follows the rules. Be specific. |
| 2 | Breaks | Bugs, wrong status codes, missing validation, security holes. File:line + why. |
| 3 | Style | Rule breaks from `rulesDirs`, names, types, Pint. File:line + rule file. |

- Name the file and line. Say why. **Do not fix it.**
- If their way works and follows the rules, say so, even if `ref/` is different.
- Say what you ran and what came out. Say what you did not run.

## "check and fix"

Same review. Then fix what is wrong in the app.

- Fix only what the review found. Nothing else.
- Then report a table so the owner learns from it:

```markdown
| File:line | Was | Now | Why |
|---|---|---|---|
| `MeController.php:14` | `return $request->user();` | `return new MeResource($request->user());` | The raw model skips the Resource. The shape would differ from register. |
```

- Run the check again after the fix. Report the result.

## What to look for (Laravel)

Quick list. The full rules are in the files `code-quality.md` maps to. Cite the file, not this list.

| Area | Look for | Boost rule file |
|---|---|---|
| Routes | right middleware (`auth:sanctum`, `throttle:*`), name, no closure left | `routing.md`, `security.md` |
| Controller | HTTP only. Validation in a Form Request. Logic in a Service. | `routing.md`, `architecture.md` |
| Form Request | rules match the ticket. Only `validated()` data goes on. | `validation.md` |
| Resource | only the fields the ticket lists. No hidden fields leak. | `routing.md` |
| Service / Repository | no Eloquent in the service if the project rules say so. No query in the controller. | `architecture.md`, `db-performance.md` |
| Model | `$fillable`, `casts()`, relations | `eloquent.md`, `security.md` |
| Migration | indexes the queries need, `foreignId()->constrained()` | `migrations.md` |
| Errors | status code and `code` match the ticket | `error-handling.md` |
| Tests | one per criterion and per decision, factories, fakes | `testing-best-practices` |

A finding with no rule behind it is taste. Mark it "optional" or drop it.

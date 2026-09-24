# "check" and "check and fix"

## "check": read-only review

1. Read the owner's files for this step or lesson. Use `git diff` against the base branch to find them.
2. Run read-only checks: `route:list`, `tinker --execute`, a curl to their local server.
3. Compare with the ticket's criteria and the project rules in `rulesDirs`. `ref/` is a guide, not the answer key.
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

| Area | Look for |
|---|---|
| Routes | right middleware (`auth:sanctum`, `throttle:*`), name, no closure left |
| Controller | thin. Validation in a Form Request. Logic in a Service. |
| Form Request | `authorize()`, rules match the ticket, messages if the ticket says |
| Resource | only the fields the ticket lists. No hidden fields leak. |
| Service / Repository | follows the project's repository rules. No query in the controller. |
| Model | `$fillable` or `$guarded`, `casts()`, no mass-assign holes |
| Migration | indexes the queries need, `foreignId()->constrained()`, sane defaults |
| Errors | status code and `code` match the ticket |
| Types | `declare(strict_types=1)` if the project uses it, param and return types |

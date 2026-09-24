# answers.md template

Short answers to "Check yourself" in the README. Same numbers.
Real example: `learn/03-base-repository/answers.md`.

```markdown
# Answers

1. **Resource, not model.** The model answers every column not in `$hidden`. Add a column later, and it leaks. `MeResource` lists fields by name. New columns stay out until you add them.

2. **No session.** `auth:sanctum` throws `AuthenticationException`. Our handler turns it into 401 with `code` `UNAUTHENTICATED`. The controller never runs.
```

## Rules

- Bold short label, then 1–4 sentences.
- Name the real class, method, or error string.
- For "what breaks" questions, give the exact error the owner would see.
- For trick questions, say it is a trick, then why.

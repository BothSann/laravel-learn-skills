# check-yourself.md template

The quiz for the lesson. Each answer sits right under its question, hidden in a click-to-open box.
The owner reads the question, thinks, then opens the box. No switching between files.

```markdown
# Check yourself

Try each one before you open the answer.

1. Why does `me` answer with `MeResource` and not the raw model?

   <details><summary>Answer</summary>

   **Resource, not model.** The model sends every column not in `$hidden`. Add a column later, and it leaks. `MeResource` lists fields by name. New columns stay out until you add them.

   </details>

2. What does `auth:sanctum` do when there is no session?

   <details><summary>Answer</summary>

   **No session.** `auth:sanctum` throws `AuthenticationException`. Our handler turns it into 401 with `code` `UNAUTHENTICATED`. The controller never runs.

   </details>
```

## Rules

- 5–8 questions. At least one "what breaks if..." and one trick question.
- Answer: bold short label, then 1–4 sentences.
- Name the real class, method, or error string.
- For "what breaks" questions, give the exact error the owner would see.
- For trick questions, say it is a trick, then why.
- Keep a blank line after `<summary>...</summary>` and before `</details>`. Without it, Markdown inside the box does not render.
- Indent the `<details>` block under its number (3 spaces), so the list numbering keeps going.

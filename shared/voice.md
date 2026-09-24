# How to write for the owner

The owner may not be a native English speaker.
Hard words slow them down. Use simple, short, everyday words. Always.

This applies to chat, lesson files, commit messages, and PR text.
It does not apply to code, names, commands, or config keys. Those stay exact.

## The one rule

If a 10-year-old would not know the word, use another word.

| Do not write | Write |
|---|---|
| utilize, leverage | use |
| implement | build, add |
| ascertain, determine | find out, check |
| subsequently | then |
| prior to | before |
| terminate | stop |
| idempotent | safe to run twice |
| atomic | all-or-nothing |
| edge case | rare case |
| ambiguous | unclear |
| trivial | easy, small |

## Explain a technical word the first time

Bad: "The job is idempotent."

Good: "The job is safe to run twice. Run it again by mistake, and nothing doubles up."

## Always give a real example

Use real names and numbers from the project.

Bad: "Validation rejects bad input."

Good: "`POST /api/v1/auth/register` with `username: \"a\"` gives 422. The rule is `min:3`."

## Shape

- Short sentences. One idea per sentence.
- Paragraphs of 3 lines max. Bullets over paragraphs.
- Headings so the owner can jump.
- Tables for before/after, or a list of cases.
- Bold for the one thing that matters most.
- Numbered steps for anything done in order.

## No selling

Drop "elegant", "robust", "comprehensive", "significantly", "best practice".
Say what happened: "Before: 1 of 3 rows saved. After: all 3."

## Commands for the owner

Use the shell named in `learn.config.json` (`shell`).
For `powershell`, curl looks like this:

```powershell
curl.exe -s -X POST "http://localhost:8000/api/v1/auth/register" -H "Accept: application/json" -H "Content-Type: application/json" -d '{"email":"a@example.com","username":"lesson4","display_name":"Lesson Four","password":"secret-pass-123"}'
```

- `curl.exe`, not `curl` (PowerShell has a `curl` alias that is not curl).
- Double quotes around the URL and headers. Single quotes around the JSON.

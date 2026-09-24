# Standing exceptions: when the agent writes in the app

The owner types app code. These are the **only** times the agent writes in the app.
Check `standingExceptions` in `learn/learn.config.json`. If a value is missing there, that exception is off.

## `phpdoc` — PHPDoc blocks

When: after the owner's code works (their check passed).

- Add docblocks to their file. **Docblocks only. Change nothing else.**
- Use array shapes where Larastan needs them: `@param array{email: string, username: string} $attributes`.
- Then tell the owner what shape each one says, in a short table:

```markdown
| Method | Docblock says |
|---|---|
| `AccountService::register()` | takes `array{email: string, username: string, display_name: string, password: string}`, returns `User` |
```

## `scribe` — Scribe attributes

When: a controller method is done.

- Add only attributes: `#[Group]`, `#[Endpoint]`, `#[ResponseFromApiResource]`, `#[Response]`.
- Match the ticket's request and answer examples.
- The owner runs `php artisan scribe:generate`.

## `migrations` — migration files

When: a step needs a table or column.

- Write the migration in the right `database/migrations/` folder (the module's, if modules are used).
- **Never run `migrate`.** Give the command. The owner runs it.
- **Never edit a migration that already ran.** Check: `php artisan migrate:status`. If it ran, write a new migration.
- After writing, explain each column, index, and default:

```markdown
| Column | Type | Why |
|---|---|---|
| `user_id` | `foreignId()->constrained()->cascadeOnDelete()` | Media belongs to a user. Delete the user, the media rows go too. |
| index `(user_id, created_at)` | index | "My uploads, newest first" reads this without a full scan. |
```

## Tests — only when asked

When: the owner says "check, write test" or asks for tests. One ask covers that lesson only.

- Pest feature tests in the app's `tests/` (the module's, if modules are used).
- Follow the project's testing skill or rules if present.
- One test per acceptance criterion, plus the rare cases in the ticket.
- Run them read-only: `php artisan test --compact --filter=MeController`. Report pass/fail with output.

## "you write it" — one named item

When: the owner says "you write it" and names the item. Example: "you write it: the UserRegistered event".

- Write that item only. Not the one next to it.
- Then explain it like a lesson step: what, why, the words.
- If the item is unclear, ask which one before writing.

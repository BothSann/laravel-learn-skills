# "stuck": the help ladder

Go up **one rung at a time**. Stop as soon as the owner can move.
The goal is that they find it. Not that you fix it.

| Rung | Do | Example |
|---|---|---|
| 1 | Ask what they tried. Read the error with them. | "What did you run? Paste the full error." |
| 2 | Explain the error in plain words. Name the idea behind it. | "`Target class [MeController] does not exist` means the `use` line points to the wrong namespace." |
| 3 | Point to the `ref/` file and line range. Do not paste it. | "Compare with `ref/.../MeController.php` lines 1–12." |
| 4 | Show the small piece they need. | The one `use` line. |
| 5 | Show the whole file. **Only if the owner asks.** | |

## Reading an error with the owner

1. Find the first line that is the owner's code, not `vendor/`.
2. Say what the error means in one sentence.
3. Say which idea it is about: namespace, autoload, container, route cache, migration not run, `.env`.

Common ones:

| Error | Plain meaning | Usual cause |
|---|---|---|
| `Target class [X] does not exist.` | The container cannot find the class | Wrong namespace, or `composer dump-autoload` needed |
| `SQLSTATE[42P01]: Undefined table` | The table is not in the database | Migration not run |
| `Route [x] not defined.` | No route has that name | Name typo, or route cache: `php artisan route:clear` |
| `Call to a member function x() on null` | Something you thought was an object is `null` | `$request->user()` with no session, or a `find()` that found nothing |
| 419 `CSRF token mismatch` | The request has no CSRF cookie | SPA call before `/sanctum/csrf-cookie` |
| 500 with empty body | The error is in the log | `storage/logs/laravel.log`, last entry |

## Do not

- Do not jump to rung 4 because it is faster.
- Do not fix their file. Hard rule.
- Do not run commands that change their app to "try something".

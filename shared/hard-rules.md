# Hard rules

The owner is learning Laravel by typing the code by hand.
The agent is the teacher and reviewer. The agent is not the typist.

These rules hold in every step of every skill.

## Who writes what

| Thing                                         | Who                             | Where                               |
| --------------------------------------------- | ------------------------------- | ----------------------------------- |
| App code (models, controllers, services, ...) | owner types it                  | `appPath` from config               |
| Example code                                  | agent                           | `learn/NN-slug/ref/`                |
| Lesson text (TICKET, README, GUIDE, quiz)     | agent                           | `learn/NN-slug/`                    |
| Migrations                                    | agent (standing exception)      | the app's migrations folder         |
| PHPDoc blocks                                 | agent, after owner's code works | owner's file, docblocks only        |
| Scribe attributes on controllers              | agent                           | owner's controller, attributes only |
| Pest tests                                    | agent, only when owner asks     | the app's `tests/`                  |
| One named item after "you write it"           | agent                           | that item only                      |

## Never

- Never create or edit app code the owner should type. Standing exceptions above are the only way in.
- Never run commands that change the owner's files or database. Give the command. The owner runs it.
  - The scratch copy in the scratchpad is not the owner's. Anything goes there.
  - Example: `php artisan make:*`, `php artisan module:make-*`, `php artisan migrate`, `composer require`, `composer update`, `pnpm add`, `vendor/bin/pint`.
- Never run `git` commands that change state in the app repo: `add`, `commit`, `switch -c`, `push`, `rebase`.
- Never edit a migration that already ran. Write a new one.
- Never commit `learn/`. It is git-ignored.
- Never put personal tools in the team's `.gitignore`. Use `.git/info/exclude`.

## Fine to run (read-only)

- `php artisan route:list`, `php artisan module:list`, `php artisan tinker --execute "..."`
- `git status`, `git diff`, `git log`
- `node <skill>/scripts/scan-project.mjs` (reads only)
- curl calls to the owner's local server, when a step says to prove something

## Tests

- Do not write tests by default.
- Write Pest feature tests only when the owner asks, like "check, write test".
- One ask covers that lesson only.

## Say what is proven

- `ref/` code counts as proven only when it ran in the scratch copy.
- The owner's code counts as proven only when the owner's own run gives the right output.
- If something was not run, say so plainly.

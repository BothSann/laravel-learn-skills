<!-- Copied from shared/review-rules.md by scripts/sync-shared.mjs. Edit that file, not this one. -->

# Review rules

General Laravel review rules. They hold in any Laravel project.
Use them on "check", after the project's own rules and before Laravel Boost (see `code-quality.md`).
A project rule wins a clash.

Each rule is short. The example shows the mistake it catches.

## Layers

- Check HTTP input in the Form Request. Keep business rules in the service. Never in a model event.
  - Example: `if (strlen($name) > 60)` inside a service is input checking. Move it to `rules()`.
- A controller validates, makes one service call, and returns a Resource.
- Get classes by injection. Not `app(Foo::class)` spread around.
- A class with one consumer and no boundary of its own gets merged into its owner.
- A service with many collaborators: pull out one closed piece that needs no mocks (for example price math). Do not split more.
- One exception class with named constructors (`OrderException::notFound()`, `::locked()`). Not ten subclasses that differ only by code and message.
- No trait that needs a property on its host class. A single-use trait is not worth its own file.
- When a new write path replaces an old one, delete the old one and its test.
- Delete methods nobody calls. Add them back when a caller needs them.
- Pass the validated array to the service. Write its keys in an array-shape PHPDoc. No one-use DTO.

## Security and login

- In a two-step login (password, then code), check the account again at the last step: active, not banned, not deleted.
- A reset-password code must not finish a login. Check what the flow is for.
- A password change ends every other session and token.
- A soft-deleted user must not log in. Keep `withTrashed()` off the login lookup.
- `$request->user()` uses the default guard. For optional auth, name it: `$request->user('sanctum')`.
- Check the actor type once, in route middleware. Otherwise a wrong actor with bad input gets 422, not 401.
- A public endpoint with guessable ids (`INV000001`, `INV000002`) returns no names or personal data.
- Public ids are hashids. Never let a raw integer through where a hashid is expected.
- Behind a proxy, turn on `trustProxies`. Otherwise every rate limit keys on the proxy IP and becomes one global limit.
- A global input cleaner must not change valid text (emoji, joiner characters).
- Changing email needs a verify step first.
- File upload: its own endpoint, type and size checked on the server.

## Database

- Migrations use the Schema builder, not raw SQL.
- Before adding a table, ask if a column does the job.
- A record that belongs to many types uses a morph relation with indexed columns.
- Block deleting a parent that still has children. Guard the bulk delete too.
- A partial update of linked fields (country, then city) checks the stored value plus the sent value together.
- A self-referencing parent must not make a cycle.
- Search real columns. An accessor like `name` is not a SQL column.
- `upsert($rows, $keys, [])` with no update columns is a plain `insert()`. The conflict target is ignored.
- On PostgreSQL, one failed statement breaks the whole transaction. `try/catch` in PHP does not save it. Use a nested `DB::transaction()` (a savepoint), or do the step after commit.
- Fix the data before dropping a column that is the only link between rows.
- `.env.example`: `KEY=` (empty) beats the `env('KEY', 'default')` default. Leave the key out to keep the default.

## At the same time (concurrency)

- A limit ("3 sends per hour") or a one-time token (reset link, OTP) is claimed all-or-nothing: a lock or a conditional update. Test two requests at once.
- `WithoutOverlapping` needs `expireAfter()` longer than the job timeout. Otherwise a killed worker holds the lock forever.
- A retry loop has a max tries and a final `failed` state.
- A queued job checks that its reason is still true before it acts (the code has not expired, the row still exists).
- Long work runs on the queue, not in the HTTP request. Stop a double click from starting it twice.

## API answers

- Never drop a key because it is null. Every row has the same keys.
- One Resource per answer shape.
- Read translated values through the model (`$this->name`). Do not return `name_en` and `name_km` side by side.
- The same idea has the same shape in every endpoint.
- Every new user-facing string gets a key in every locale file.
- Document every success answer (with its `meta`) and every error a client can reach.

## Names

- Leave out words the namespace already says. In `Billing\`, use `InvoiceService`, not `BillingInvoiceService`.
- Leave out words the arguments already say: `revokeAll($userId)`, not `revokeAllForUser($userId)`.
- Two classes must not differ only by singular vs plural.
- Repository methods name the storage step: `create()`, not `createInvoice()`.
- Copy Eloquent's words: `findWithTrashed()`.
- One idea, one word, in class, command, and lock names.
- Relations are short: `author()`, not `authorUser()`. Add a word only when there are two relations to the same model.
- A method that looks like a relation must return a relation. Otherwise make it an `Attribute` accessor.

## Tests

- The test path mirrors the source path: `src/Services/Billing.php` becomes `tests/Unit/Services/BillingTest.php`.
- Test the path users take (the HTTP call, the Livewire action), not only the model method.
- Do not mock `DB::transaction` when you test rollback.
- Every acceptance criterion and every refusal has a test.
- A security gate is tested for every actor: guest, wrong type, inactive, banned, allowed.
- No test that compares a value with where it came from (`config('x')` against `env('X')`). Assert the literal.
- A cached read gets two tests: a second call runs no query, and every write path clears it.

## Commands and deploy

- A command exits non-zero only on a real failure. Normal skips are not failures.
- A counter means what it says. Do not count "updated" when nothing changed.
- `QUEUE_CONNECTION` is not `sync`, so a worker must run.
- The healthcheck calls `/up` and expects 200.
- Stop grace period is longer than the job timeout. `retry_after` is longer than `timeout`.
- The web server body limit allows the largest upload your rules accept.

## How to write a review

1. Name the head commit and the base branch.
2. List the checks you ran. List what you did not run, and why.
3. Do not raise a problem the change copied from existing code. It is not new.
4. Each finding gets:
   - a severity: **P1** breaks prod or security, **P2** wrong behavior, **P3** quality or naming
   - a one-line title
   - an Actual / Expected row with a real input
   - a fix
   - the rule it breaks
5. Keep questions apart from findings.
6. On a recheck, prove each fix by running it. Reading it is not proof.
7. Check how the framework behaves in `vendor/` or by running it. Not from memory.

Example finding:

```markdown
**P2 — Login ignores a soft-deleted user**

| Request | Actual | Expected |
|---|---|---|
| Deleted user posts the right password | 200 and a token | 401 `Account is not active.` |

**Fix:** drop `withTrashed()` from `findByEmail()`, and add the deleted-user case to `LoginTest`.
```

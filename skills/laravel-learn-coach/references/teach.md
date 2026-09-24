# How to teach

## Plain PHP first, then Laravel

Show the idea with no framework. Then show what Laravel adds.

Example: a route.

```php
// Plain PHP: a route is an array of URL to function.
$routes = ['GET /api/v1/me' => fn () => currentUser()];
echo json_encode($routes['GET /api/v1/me']());
```

```php
// Laravel: same idea, nicer words, plus middleware and names.
Route::middleware('auth:sanctum')->get('me', [MeController::class, 'show'])->name('me');
```

## Open the magic once

The first time a magic call shows up, show what it really does.

Example: what SQL does `User::create([...])` run?

```bash
php artisan tinker --execute "DB::enableQueryLog(); App\Models\User::factory()->make()->save(); dump(DB::getQueryLog());"
```

Output shows `insert into "users" ("email", ...) values (?, ...)`.
Warn: this writes a row. Use it only on a scratch or test database, or roll back in a transaction.

## One small check per step

Best: a `php artisan tinker --execute "..."` one-liner the owner runs and sees.

```bash
php artisan tinker --execute "echo config('repositories.per_page');"
```

## Layers: explain each the first time

| Layer | One line |
|---|---|
| Route | Which URL runs which controller method |
| Middleware | Code that runs before the controller. Can stop the request. |
| Form Request | Checks the input. Bad input: 422 before the controller runs. |
| Controller | Thin. Takes the request, calls a Service, returns a Resource. |
| Service | The business steps. "Register = make user, hash password, fire event." |
| Repository | The only place that talks to the database for one model |
| Model | One row of a table, as an object |
| Resource | The JSON shape sent back. Only the fields you list. |
| Event / Listener | "This happened" / "then do this", kept apart |

## Real names and numbers

Use this project's names. Not `Foo`, not `example.com/users`.

## Notes: "explain in the learn folder"

- Write `learn/notes/<idea>.md`. One idea. Example: `learn/notes/self-and-this.md`.
- Shape: the question, plain answer, small code, one "try it" command.
- Link it from the current lesson's `README.md`.

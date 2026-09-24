# GUIDE.md template

The long file. Each step: **what, why, how, the code, the words, a check.**
Real example: `learn/03-base-repository/GUIDE.md`.

```markdown
# Guide: me endpoint

You type the code. This guide says what, why, and how for each step.
Full working code is in `ref/`. Look at it after you try.

I ran all of this in a scratch copy (SQLite, not your database). 4 criteria passed. Pint and Larastan gave 0 errors.

## The big idea

Today:

    Route::middleware('auth:sanctum')->get('me', fn () => request()->user());

After this ticket:

    Route::middleware('auth:sanctum')->get('me', [MeController::class, 'show']);

Request path:

    curl  ->  auth:sanctum (401 if no session)  ->  MeController::show  ->  MeResource  ->  JSON

## Words used in this guide

- **Guard**: ...

## Step 3: `MeController::show()`

**What.** One method. It takes the logged-in user and answers with `MeResource`.

**Why.** The stub returns the raw model. Then `password` rules and field names depend on `$hidden`. A Resource says the shape in one place.

**Plain PHP first.** Without Laravel it would be:

    function show(array $session): string {
        $user = findUser($session['user_id']);
        return json_encode(['data' => ['id' => $user['id'], 'username' => $user['username']]]);
    }

Laravel does the session lookup (`$request->user()`) and the JSON (`MeResource`).

**How.**

File: `apps/api/asgard/Api/src/Http/Controllers/V1/MeController.php`

    public function show(Request $request): MeResource
    {
        return new MeResource($request->user());
    }

**Check.**

    php artisan route:list --path=me

You should see `MeController@show`, not `Closure`.
```

## Rules

- Start from plain PHP. Then show what Laravel adds.
- Open the magic once. Example: show the SQL that `User::create([...])` runs.
- One check per step. Best is a `php artisan tinker --execute "..."` one-liner, a curl, or `route:list`.
- "You should see" uses the real output from the scratch run.
- Commands in the owner's `shell`. PowerShell curl: `curl.exe`, double quotes on URL and headers, single quotes on JSON.
- Generator commands exactly as the owner runs them, from `generator` in config.
- Git steps list the exact commands. The owner runs them.
- The last step is ship: gates from config, one commit per small piece in `commitStyle`, PR against `baseBranch`.

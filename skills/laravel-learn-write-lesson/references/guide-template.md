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

## Rules this lesson follows

| Choice in the code | Rule | Source |
|---|---|---|
| `MeController::show()` only returns a Resource | Controllers stay HTTP-only | project: `architecture.md` "API read/write shape" |
| Answer through `MeResource`, not the model | For APIs, default to Eloquent API Resources | project: `laravel.md` "APIs And Eloquent Resources" |

Clashes between project rules and Boost: none. (Or: name the clash and say the project rule won.)

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

- "Rules this lesson follows" is required. How to fill it: `code-quality.md`, "Show the owner where each choice comes from".
- In each step, the **Why** names the rule when one drove the choice.
- Start from plain PHP. Then show what Laravel adds.
- Open the magic once. Example: show the SQL that `User::create([...])` runs.
- One check per step. Best is a `php artisan tinker --execute "..."` one-liner, a curl, or `route:list`.
- A check must pass using only the steps done so far. Bad: step 3 (controller) says `route:list` shows the controller, but the route is wired in step 4.
- Code in this template is shape only. Copy the real shape from the sibling files. Example: if `AuthController` answers with `ApiResponse::success(data: new MeResource($user))`, a new controller does the same, not `return new MeResource(...)`.
- If the scratch run showed an existing test breaks, add a "you type" step that fixes it, with the before and after line.
- "You should see" uses the real output from the scratch run.
- Commands in the owner's `shell`. PowerShell curl: `curl.exe`, double quotes on URL and headers, single quotes on JSON.
- Generator commands exactly as the owner runs them, from `generator` in config.
- Git steps list the exact commands. The owner runs them.
- The last step is ship: gates from config, one commit per small piece in `commitStyle`, PR against `baseBranch`.

# "done": give the next step

## 1. Quick check of the step they finished

Run the step's check yourself (you, the agent), if it is read-only:

| Step kind | Quick check |
|---|---|
| Branch | `git status`, `git log --oneline -1` |
| Generate | the file exists at the expected path |
| Type a file | read it. Look for the one thing the step is about. |
| Route | `php artisan route:list --path=<uri>` |
| Migration ran | `php artisan tinker --execute "echo json_encode(Schema::getColumnListing('media'));"` |
| Curl | ask the owner to paste the output. Compare with the ticket. |

- Passes: say so in one line. Go to 2.
- Fails: say what you saw, in one or two lines. Do not give the next step. Offer "check" for a full review.

## 2. Give the next step

Take it from `GUIDE.md`. Give only:

- The step number and title
- The file path, or the command
- What to write and why (short, from the guide)
- The check to run, and what they should see

Do not paste the full code from `ref/`. The guide has the code to type. Point to it: "GUIDE.md, step 4".

## 3. Update the README

In the lesson `README.md`, "Where you are now":

```markdown
## Where you are now

- Steps 0–3 done. `MeController` typed and checked.
- Next: step 4, the route line.
```

## Example

Owner: "done"

```markdown
Step 3 checked: `MeController::show()` returns `new MeResource($request->user())`. Good.

## Step 4: the route

File: `apps/api/asgard/Api/routes/api/v1.php`, line 12.

Swap the closure for the controller. Code is in GUIDE.md, step 4.

Why: the closure skips `MeResource`. The controller uses it.

Check:

    php artisan route:list --path=me

You should see `Asgard\Api\Http\Controllers\V1\MeController@show`.

Say **done**, **stuck**, or **check**.
```

# Scoring: which 3 tasks to offer

## 1. Make the candidate list

From the scan JSON:

| Source | Candidate |
|---|---|
| `lessons` with `status: in-progress` | "Finish lesson NN" |
| `lessons` with `status: proposed` | "Start lesson NN" (ticket exists, no ref yet) |
| `endpoints.stubs` | Replace the stub with a real controller |
| `endpoints.missing` | Build the endpoint |
| Tables the doc needs but `tables` lacks | Migration + model (only if an endpoint needs it next) |

Group endpoints that must ship together. Example: `GET` + `DELETE /api/v1/users/{username}/follow` share one table. Still offer them as separate tasks when each one stands alone.

## 2. Drop what cannot start yet

A task cannot start if what it needs is missing.

| Task | Needs |
|---|---|
| `POST /api/v1/auth/logout` | login (you cannot log out without a session) |
| `GET /api/v1/users/{username}/posts` | `posts` table |
| `POST /api/v1/posts` with media | `POST /api/v1/media` |

Read the endpoint's "Does" column and the build order to find these.

## 3. Rank

| Signal | Score |
|---|---|
| Lesson `in-progress` | always first |
| In the earliest unfinished build order step | +3 |
| A stub route (half done, small) | +2 |
| Teaches a Laravel idea not in past lessons | +2 |
| Reuses a class the owner already built | +1 (practice) |
| Needs a new package | −1 (more setup, less Laravel) |
| Bigger than one endpoint or one table | do not offer. Split it. |

Past lessons: read the `title` of each `done` lesson in the scan. Read their README "New words" only if you must check an idea is new.

## 4. Pick 3

- The top score is **next in build order**.
- Options 2 and 3 should teach **different** ideas. Not three CRUD endpoints of the same shape.
- Mix sizes when you can: S = one file changed or a stub replaced. M = new migration + model + endpoint.

## Example

Scan says: register done, `me` is a stub, login/logout missing, no lesson in progress.

| Candidate | Build step | Stub | New idea | Score |
|---|---|---|---|---|
| `GET /api/v1/me` | step 1 (+3) | yes (+2) | `auth:sanctum` guard (+2) | 7 |
| `POST /api/v1/auth/login` | step 1 (+3) | no | `Auth::attempt`, sessions (+2) | 5 |
| `POST /api/v1/auth/logout` | step 1 (+3) | no | needs login first | dropped |
| `POST /api/v1/media` | step 2 | no | file upload, disks (+2) | 2 |

Offer: `me` (next), login, media.

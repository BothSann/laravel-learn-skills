# Scratch run: prove `ref/` works

Prove the lesson code in a **copy** of the app. Never in the owner's app. Never on the owner's database.

## 1. Make the copy

Copy `appPath` into the scratchpad. Skip heavy or private folders.

```bash
SCRATCH="<scratchpad>/lesson-04"
rsync -a --exclude node_modules --exclude storage/logs --exclude .env <repo>/apps/api/ "$SCRATCH/"
```

No `rsync` (Windows Git Bash): use `cp -r`, then delete `storage/logs/*`.

Keep `vendor/`. It saves a slow `composer install`.

## 2. Point it at SQLite

```bash
cd "$SCRATCH"
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
```

In `.env`:

```dotenv
DB_CONNECTION=sqlite
DB_DATABASE=<absolute path>/database/database.sqlite
CACHE_STORE=array
SESSION_DRIVER=array
QUEUE_CONNECTION=sync
MAIL_MAILER=array
```

Check: `php artisan db:show` says `SQLite`. **Stop if it says `pgsql` or `mysql`.**

## 3. Put `ref/` on top

```bash
cp -r <repo>/learn/04-me-endpoint/ref/apps/api/. "$SCRATCH/"
php artisan migrate:fresh --force
```

`migrate:fresh` is fine here. It is the scratch database.

## 4. Prove each criterion

Start a server on a free port. Then one curl per criterion.

```bash
php artisan serve --port=8123 &
curl -s -i "http://127.0.0.1:8123/api/v1/me" -H "Accept: application/json"
```

Write down the real status and body. They go in `GUIDE.md` as "you should see".

For cookie or session flows, keep a cookie jar: `-c jar.txt -b jar.txt`.

Stop the server after.

## 5. Run the gates

Every command in `gates`, plus the tests in `ref/`:

```bash
vendor/bin/pint --test
vendor/bin/phpstan analyse
php artisan test --compact
```

In the scratch copy, fixing with Pint is fine. Copy the fixed file back into `ref/`.

## 6. Record the result

In `GUIDE.md` intro, one line:

> I ran all of this in a scratch copy (SQLite, not your database). 4 criteria passed. 25 tests passed. Pint and Larastan gave 0 errors.

If something was not run, say which and why.

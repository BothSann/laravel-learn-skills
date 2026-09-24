# laravel-learn-pick-task

Finds what is not built yet in your Laravel app. Offers 3 tasks to learn from. Writes the ticket for the one you pick.

## What it covers

- First run: makes `learn/learn.config.json` with you
- A read-only scanner: routes, tables, classes, tests, lessons
- Doc endpoints split into done, stub, and missing
- Ranking: build order first, small slices, new Laravel ideas
- `TICKET.md` with story, scope, criteria, decisions

## Skill structure

```
laravel-learn-pick-task/
├── SKILL.md                    the flow
├── scripts/scan-project.mjs    read-only scanner, JSON on stdout
└── references/
    ├── first-run.md            make learn.config.json
    ├── scoring.md              rank the candidates
    ├── ticket-template.md      TICKET.md shape
    └── shared/                 copied from ../../shared by npm run sync
```

## Try the scanner

```bash
node scripts/scan-project.mjs /path/to/repo --no-artisan
```

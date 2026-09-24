# laravel-learn-write-lesson

Turns a picked ticket into a lesson you can follow. The agent writes the full answer in `ref/`, proves it runs, then gives you one step at a time.

## What it covers

- Confirm the ticket's decisions with you
- Full reference code in `learn/NN-slug/ref/`, same paths as your app
- A proof run in a scratch copy with SQLite. Never your database.
- `README.md`, `GUIDE.md`, `answers.md`
- Step 1 only, then wait

## Skill structure

```
laravel-learn-write-lesson/
├── SKILL.md
└── references/
    ├── scratch-run.md          prove ref/ in a copy of the app
    ├── readme-template.md
    ├── guide-template.md
    ├── answers-template.md
    └── shared/                 copied from ../../shared by npm run sync
```

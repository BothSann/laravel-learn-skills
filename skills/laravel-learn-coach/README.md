# laravel-learn-coach

Walks with you while you type the lesson. You say a word. It does that one thing.

| You say | It does |
|---|---|
| done | checks the step, gives the next one |
| stuck | helps one rung at a time |
| check | reviews your code, read-only |
| check and fix | reviews, fixes, shows a table of what and why |
| check, write test | writes Pest tests for this lesson |
| you write it: X | writes X only |
| ship it | gates, curl proofs, commits, PR text |

## Skill structure

```
laravel-learn-coach/
├── SKILL.md                    router: word to reference
└── references/
    ├── next-step.md
    ├── stuck.md
    ├── check.md
    ├── standing-exceptions.md  PHPDoc, Scribe, migrations, tests, "you write it"
    ├── teach.md
    ├── ship.md
    └── shared/                 copied from ../../shared by npm run sync
```

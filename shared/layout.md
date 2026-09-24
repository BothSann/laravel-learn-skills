# Lesson layout

All lesson files live in `learn/` at the repo root. `learn/` is git-ignored.

```
learn/
  learn.config.json          project facts (see project-config.md)
  01-foundation-api-response/
    TICKET.md                the job: story, scope, criteria, decisions
    README.md                goal, new words, step table, check yourself
    GUIDE.md                 each step: what, why, how, code, words, check
    answers.md               short answers to "check yourself"
    ref/                     full working code, same paths as the real app
      apps/api/asgard/Foundation/src/Support/Http/ApiResponse.php
  notes/
    self-and-this.md         one idea per note, written when the owner asks
```

## Names

- Folder: `NN-kebab-slug`. `NN` is two digits and follows build order. Example: `04-me-endpoint`.
- The next number is the highest `NN` in `learn/` plus 1.

## `ref/` mirrors real paths

The owner can compare one folder with the real one:

```bash
diff -r learn/03-base-repository/ref/apps/api/asgard/Foundation apps/api/asgard/Foundation
```

## Lesson status

`TICKET.md` starts with frontmatter. The scanner reads `status`.

```markdown
---
id: XS-5
status: in-progress
---
```

| Status | Means | Set by |
|---|---|---|
| `proposed` | task picked, ticket written, decisions not confirmed | `laravel-learn-pick-task` |
| `in-progress` | `ref/` and guide written, owner is typing | `laravel-learn-write-lesson` |
| `done` | criteria proven, PR open or merged | `laravel-learn-coach` (ship) |
| `dropped` | owner chose to stop it | owner or agent on request |

A lesson with no `TICKET.md` or no `status` shows as `unknown` in the scan.

## Notes

- `learn/notes/NN-idea.md` or `learn/notes/idea.md`. One idea each.
- Write one when the owner says "explain in the learn folder".
- Link it from the lesson README.

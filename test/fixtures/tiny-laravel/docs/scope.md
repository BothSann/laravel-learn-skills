# Tiny API scope

## 1. Posts

| Method | Path | Auth | Does |
|---|---|---|---|
| GET | `/api/posts` | public | List posts. |
| GET | `/api/posts/{post}` | public | One post. |
| POST | `/api/posts` | user | Create a post. |

## 2. Comments

- `POST /api/posts/{post}/comments`

## 3. Build order

1. Posts
2. Comments

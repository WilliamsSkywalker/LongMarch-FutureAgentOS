# P1 API Specification

## New Endpoints

### 1. POST /apps/:id/like
Like an app. Requires auth.
- Headers: `Authorization: Bearer <token>`
- URL param `:id` is the app UUID (string)
- Check if app exists, return 404 if not
- Check if user already liked this app, return 409 if already liked
- Insert into `app_likes` table
- Increment `likes` counter on `apps` table: `UPDATE apps SET likes = likes + 1 WHERE id = ?`
- Return: `{ liked: true, likes: number }`
- Errors: 400 (no auth), 404 (app not found), 409 (already liked), 500

### 2. DELETE /apps/:id/like
Unlike an app. Requires auth.
- Headers: `Authorization: Bearer <token>`
- Check if like exists, silently succeed if not found (return 200 regardless)
- Delete from `app_likes` table
- Decrement `likes` counter on `apps` table: `UPDATE apps SET likes = likes - 1 WHERE id = ?` (use `MAX(0, likes - 1)` or just subtract and trust it won't go below 0)
- Return: `{ liked: false, likes: number }`
- Errors: 401 (no auth), 404 (app not found), 500

### 3. POST /apps/:id/favorite
Favorite an app. Requires auth.
- Headers: `Authorization: Bearer <token>`
- Check if app exists, return 404 if not
- Check if already favorited, return 409 if already favorited
- Insert into `user_favorites` table
- Return: `{ favorited: true }`
- Errors: 401 (no auth), 404 (app not found), 409 (already favorited), 500

### 4. DELETE /apps/:id/favorite
Unfavorite an app. Requires auth.
- Headers: `Authorization: Bearer <token>`
- Check if favorite exists, silently succeed if not
- Delete from `user_favorites` table
- Return: `{ favorited: false }`
- Errors: 401 (no auth), 404 (app not found), 500

### 5. POST /apps/:id/fork
Fork an app. Requires auth.
- Headers: `Authorization: Bearer <token>`
- URL param `:id` is the app UUID (string)
- Get the original app by UUID, return 404 if not found
- Create a new app entry with:
  - Same name, description, icon, tags, code, preview_html
  - New UUID (generate fresh)
  - `author_id` = current user ID
  - `forked_from` = original app's ID
  - `is_public` = 1 (default)
- Increment original app's `forks` counter: `UPDATE apps SET forks = forks + 1 WHERE id = ?`
- Return: `{ app: { ...newApp } }` (full app object like POST /apps)
- Errors: 401 (no auth), 404 (app not found), 500

### 6. POST /apps/:id/comments
Post a comment. Requires auth.
- Headers: `Authorization: Bearer <token>`
- URL param `:id` is the app UUID (string)
- Body: `{ content: string }`
- Validate: content is non-empty string (return 400 if missing/empty)
- Check if app exists, return 404 if not
- Insert into `comments` table
- Return: `{ comment: { id, user_id, user_name, user_avatar, content, created_at } }`
- Errors: 400 (missing content), 401 (no auth), 404 (app not found), 500

### 7. GET /apps/:id/comments
Get comments for an app.
- URL param `:id` is the app UUID (string)
- Check if app exists, return 404 if not
- Query comments joined with users, ordered by created_at DESC
- Return: `{ comments: [{ id, user_id, user_name, user_avatar, content, created_at }, ...] }`
- Errors: 404 (app not found), 500

### 8. GET /users/:id/favorites
Get user's favorite apps.
- URL param `:id` is numeric user ID
- Query `user_favorites` joined with `apps` and `users` for the app owner
- Return: `{ apps: [{ id, uuid, name, description, author_name, author_avatar, icon, tags, likes, uses, forks, created_at }, ...], total: number }`
- Errors: 404 (user not found), 500

## Shared Notes
- `:id` in URL params for apps is the UUID string (NOT the numeric ID), except in `forked_from` which is stored as the numeric ID in the DB
- All operations use `better-sqlite3` synchronous API
- `try/catch` around all DB operations, return 500 on errors
- Return `{ error: 'message' }` on all error responses
- For auth: `const userId = req.user!.userId` from `AuthRequest`
- Look up app by UUID first: `db.prepare('SELECT id, uuid FROM apps WHERE uuid = ?').get(uuid)`
- Join users to get user_name and user_avatar for comments
- `tags` and `code` stored as JSON strings, parse with `JSON.parse()` when returning

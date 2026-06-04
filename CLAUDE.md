# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server (localhost:3000)
npm run build    # production build
npm run lint     # ESLint via next lint
```

No test runner is wired up. Playwright is installed as a devDependency but has no test files yet.

## Environment variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Optional (enables user deletion in admin panel):
```
SUPABASE_SERVICE_ROLE_KEY=
```

## Architecture

**Next.js 14 App Router** with **Supabase** (auth + PostgreSQL) and **Tailwind CSS**.

### Auth & routing

`src/middleware.ts` guards every request. Unauthenticated requests to `/dashboard/**` or `/admin/**` redirect to `/login`; authenticated users hitting `/login` or `/signup` redirect to `/dashboard`. The root `/` immediately redirects to `/dashboard`.

### Supabase client variants

Three separate clients exist — use the right one for context:

| File | When to use |
|------|-------------|
| `src/lib/supabase/server.ts` | Server Components and Server Actions (uses `next/headers` cookies) |
| `src/lib/supabase/client.ts` | Client Components (`"use client"`) |
| `src/lib/supabase/admin.ts` | Admin operations that bypass RLS (requires `SUPABASE_SERVICE_ROLE_KEY`) |

### Data flow pattern

All mutations are **Next.js Server Actions** in `actions.ts` files co-located with their routes:
- `src/app/dashboard/actions.ts` — bookmark CRUD + category CRUD
- `src/app/admin/actions.ts` — role changes and user deletion (admin-only, asserts role before acting)

Pages are async Server Components that fetch data directly via the server Supabase client, then pass it to Client Components for interactivity.

### Database tables

- **bookmarks** — `id, title, url, description, tags (text[]), user_id, created_at, category_id`
- **categories** — `id, name, user_id, created_at`
- **profiles** — `id, email, role ("admin"|"user"), created_at` — mirrors `auth.users`; RLS allows admins to read all rows

### Role / permission model

`profiles.role` drives access. The dashboard page checks this to show/hide the admin panel link. Admin page re-checks server-side and redirects non-admins. `admin/actions.ts` has a shared `assertAdmin()` helper that both Server Actions call before doing anything.

### Tailwind custom tokens

- **Color:** `midnight` (`#1E2761`), `midnight-dark` (`#16205A`), `midnight-light` (`#EEF0FA`)
- **Shadow:** `shadow-card`, `shadow-card-hover`
- **Font:** Pretendard loaded via CDN `<link>` in `layout.tsx`

The UI language is Korean (`<html lang="ko">`).

### Legacy files

`src/lib/storage.ts` and the top-level `src/components/` files (`AddBookmarkForm.tsx`, `AuthForm.tsx`, `BookmarkCard.tsx`) are superseded by the Server Actions pattern and the route-colocated components under `src/components/dashboard/` and `src/components/admin/`. Prefer the newer ones.

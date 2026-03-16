# TinyNotes Execution Plan
Runtime-first incremental build for Codex.

This plan defines how Codex must build the TinyNotes application.

The build follows a **runtime-first strategy**. The Next.js development server must start successfully before backend infrastructure is added.

The application must be runnable with:

bun run dev

after the first milestone and after every milestone thereafter.

---

# Phase 1 — Runtime Boot

Goal: ensure the Next.js application boots before any backend code is added.

## C1 — Initialize Next.js Runtime

Create a minimal Next.js App Router project structure.

Required dependencies:

- next
- react
- react-dom
- typescript

Required files:

package.json  
next.config.ts  
tsconfig.json  

src/app/layout.tsx  
src/app/page.tsx  
src/app/not-found.tsx  
src/app/globals.css  

Required scripts in package.json:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "db:migrate": "bun run scripts/migrate.ts",
  "db:seed": "bun run scripts/seed.ts",
  "test": "bun test",
  "test:e2e": "bunx playwright test"
}
```


Validation:

1. Run:

bun install  
bun run dev  

2. Open browser:

http://localhost:3000

Expected result:

- Next.js dev server starts successfully
- The root page renders
- No runtime errors appear

If this milestone fails, fix runtime wiring before continuing.

---

## C2 — Create Repository Structure

Create the core directory layout:

src/app  
src/db  
src/lib  
scripts  
tests  

Add placeholder files:

src/lib/env.ts  
src/db/client.ts  
scripts/migrate.ts  

Validation:

bun run dev

The dev server must still start successfully.

---

# Phase 2 — Data Layer

Goal: add SQLite persistence.

## C3 — SQLite Client

File:

src/db/client.ts

Responsibilities:

- open SQLite database connection
- export singleton connection

Environment variable:

DATABASE_PATH

Validation:

bun run dev

---

## C4 — Migration Runner

Files:

scripts/migrate.ts  
src/db/migrations/

Create migration ledger:

CREATE TABLE IF NOT EXISTS _migrations (
  filename TEXT PRIMARY KEY,
  checksum TEXT NOT NULL,
  applied_at TEXT NOT NULL
);

Command:

bun run db:migrate

Validation:

- database file is created
- migration ledger exists
- running migrations again produces no changes

Then verify runtime:

bun run dev

---

## C5 — Database Schema

Create migration files:

src/db/migrations/0001_better_auth.sql  
src/db/migrations/0002_notes.sql  

Tables required:

user  
session  
notes  

Notes table columns:

id  
owner_user_id  
title  
content_json  
is_shared  
share_token  
shared_at  
created_at  
updated_at  

Indexes:

idx_notes_owner_updated  
idx_notes_share_token_unique  

Validation:

bun run db:migrate  
bun run dev

---

# Phase 3 — Authentication

Goal: integrate better-auth without breaking runtime.

## C6 — better-auth Integration

Files:

src/lib/auth.ts  
src/lib/session.ts  
src/app/api/auth/[...all]/route.ts  

Environment variables:

BETTER_AUTH_SECRET  
BETTER_AUTH_URL  

Validation:

bun install
bun run dev

Auth endpoint must respond successfully.

---

## C7 — Validation and Contracts

Files:

src/lib/contracts.ts  
src/lib/validation.ts  
src/lib/errors.ts  

Error codes:

VALIDATION_ERROR  
UNAUTHENTICATED  
NOT_FOUND  
CONFLICT  
CSRF_INVALID  
INTERNAL_ERROR  

Validation:

bun run dev

Invalid payloads must return VALIDATION_ERROR.

---

# Phase 4 — Notes Feature

Goal: implement the TinyNotes functionality.

## C8 — Notes Repository

Files:

src/db/notes-repo.ts  
src/lib/token.ts  
src/lib/time.ts  

Implement SQL operations:

create note  
update note  
delete note  
list notes  
enable share  
disable share  

Validation:

bun install
bun run dev  
bun test

---

## C9 — Authentication Server Actions

File:

src/app/(auth)/actions.ts  

Actions:

signUpAction  
signInAction  
signOutAction  

Validation:

bun run dev

Login and signup pages must render.

---

## C10 — Notes Server Actions

File:

src/app/(authed)/notes/actions.ts  

Actions:

createNoteAction  
updateNoteAction  
deleteNoteAction  
enableShareAction  
disableShareAction  

Validation:

bun run dev

---

## C11 — Route Pages

Create pages:

/login  
/signup  
/notes  
/notes/new  
/notes/[noteId]  
/s/[token]  

Redirect rules:

- unauthenticated users visiting /notes redirect to /login
- authenticated users visiting /login redirect to /notes

Validation:

bun run dev

Verify redirects behave correctly.

---

## C12 — UI Components

Create components:

LoginForm.tsx  
SignupForm.tsx  
NoteEditorForm.tsx  
ShareControls.tsx  
DeleteNoteButton.tsx  

Integrate TipTap editor.

Validation:

bun run dev

Editor must load without runtime errors.

---

## C13 — Security Layer

Files:

next.config.ts  
middleware.ts  

Add security headers:

X-Frame-Options  
X-Content-Type-Options  
Referrer-Policy  
Permissions-Policy  

Add origin checks for mutating actions.

Validation:

bun run dev

---

## C14 — Seed Data and Tests

Files:

scripts/seed.ts  
tests/

Commands:

SEED_DEMO_DATA=1 bun run db:seed  
bun test  
bunx playwright test  

Validation:

- seed script runs without duplication
- all tests pass

---

# Global Execution Rules

Codex must follow these rules:

1. Execute milestones strictly in order: C1 through C14.
2. After each milestone run:

bun run dev

3. If the dev server fails to start, fix the problem before continuing.
4. Do not expand scope beyond this plan.
5. Initial page data must be loaded using Server Components.
6. All mutations must use Server Actions.
7. Do not fetch initial page data from the client.

---

# Debug Checklist

If a milestone fails:

1. verify environment variables
2. verify database migrations
3. verify SQL queries
4. verify session retrieval
5. verify redirect logic
6. verify sanitizer output
7. rerun failing tests

---

# Acceptance Criteria

The application is complete when:

- Users can register and log in
- Notes can be created, edited, and deleted
- Notes can be shared via secure links
- Shared notes can be revoked
- Unauthorized access returns 404
- Script injection is prevented by sanitization
- All automated tests pass



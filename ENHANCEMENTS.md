# TinyNotes Post-v1 Enhancements Plan

This plan defines post-v1 improvements for TinyNotes.

These enhancements must be implemented on top of the existing working application.
They must not break existing authentication, note CRUD, sharing, or public note rendering.

The existing `PLANS.md` remains the source of truth for the base application build.
This file is the source of truth only for the enhancements listed here.

---

# Enhancement Execution Rules

1. Implement enhancements strictly in order: E1 through E5.
2. Do not modify unrelated functionality.
3. Preserve existing routing, authentication, share links, and note rendering.
4. After each enhancement run:

bun run dev

5. If the dev server fails, fix the issue before continuing.
6. Prefer Server Components for reads.
7. Prefer Server Actions for writes.
8. Keep styling simple and consistent with the current app.

---

# E1 — Inline Note Title Editing

Goal: allow note titles to be edited directly on the note page.

Requirements:

- The note title must be editable inline on the note detail page.
- Editing the title must preserve the existing update/save flow.
- Title editing must not depend on the first line of note content.
- Existing note content editing must continue to work.

Validation:

- bun run dev
- open an existing note
- edit the title inline
- save/update the note
- verify the new title persists
- verify the notes list shows the updated title

---

# E2 — Delete Confirmation Modal

Goal: prevent accidental note deletion.

Requirements:

- Replace the current delete confirmation flow with a proper confirmation modal.
- The modal must clearly ask the user to confirm deletion.
- Deletion must not happen until the user confirms.
- Existing delete behavior must remain the same after confirmation.

Validation:

- bun run dev
- open a note
- click delete
- confirm the modal appears
- cancel and verify the note is not deleted
- confirm deletion and verify the note is removed

---

# E3 — Copy Share Link Button

Goal: make sharing easier.

Requirements:

- In the share controls, add a button that copies the share URL to the clipboard.
- Show a small success message or state after copying.
- Preserve the existing share enable/disable behavior.
- Do not change the share URL format.

Validation:

- bun run dev
- open a shared note
- click copy share link
- verify the URL is copied
- verify the success state/message appears
- verify share disable still works

---

# E4 — Note Sorting

Goal: ensure notes are consistently sorted by most recently updated first.

Requirements:

- The notes list must be sorted by newest `updated_at` first.
- Repository/query behavior and UI behavior must match.
- Sorting must be stable and consistent after editing a note.

Validation:

- bun run dev
- create or edit multiple notes
- verify most recently updated notes appear first on /notes

---

# E5 — Search Notes

Goal: allow users to filter their notes by title.

Requirements:

- Add a simple search input on the /notes page.
- Search must filter only the current user's notes.
- Search must match note titles.
- Implement search with a small SQLite query update.
- Keep the UI simple; no advanced filters or query-builder behavior.
- Preserve the existing notes page layout.

Validation:

- bun run dev
- create notes with distinct titles
- search by title
- verify matching notes appear
- verify non-matching notes are hidden
- verify clearing the search restores the full list

---

# Suggested Implementation Grouping

For safer execution, implement enhancements in two batches:

Batch 1:
- E1
- E2
- E3

Batch 2:
- E4
- E5

---

# Acceptance Criteria

The enhancement plan is complete when:

- note titles can be edited inline
- delete requires explicit confirmation in a modal
- share links can be copied with one click
- notes are sorted newest first
- notes can be searched by title
- existing TinyNotes functionality continues to work
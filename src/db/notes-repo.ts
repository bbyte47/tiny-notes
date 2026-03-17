import { randomUUID } from "node:crypto";
import { db } from "./client";
import { noteMutationContract } from "../lib/contracts";
import { parseContract } from "../lib/validation";
import { createShareToken } from "../lib/token";
import { nowIso } from "../lib/time";

type NoteRow = {
  id: string;
  owner_user_id: string;
  title: string;
  content_json: string;
  is_shared: number;
  share_token: string | null;
  shared_at: string | null;
  created_at: string;
  updated_at: string;
};

export type NoteRecord = {
  id: string;
  ownerUserId: string;
  title: string;
  contentJson: string;
  isShared: boolean;
  shareToken: string | null;
  sharedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type NoteMutation = {
  ownerUserId: string;
  title: string;
  contentJson: string;
};

type NoteTarget = {
  noteId: string;
  ownerUserId: string;
};

type ListNotesOptions = {
  titleQuery?: string;
};

function mapNote(row: NoteRow): NoteRecord {
  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    title: row.title,
    contentJson: row.content_json,
    isShared: row.is_shared === 1,
    shareToken: row.share_token,
    sharedAt: row.shared_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function hasNoChanges(result: { changes?: number }): boolean {
  return (result.changes ?? 0) === 0;
}

export function getNoteById(
  noteId: string,
  ownerUserId: string
): NoteRecord | null {
  const row = db
    .prepare(
      `
      SELECT
        id,
        owner_user_id,
        title,
        content_json,
        is_shared,
        share_token,
        shared_at,
        created_at,
        updated_at
      FROM notes
      WHERE id = ? AND owner_user_id = ?
      `
    )
    .get(noteId, ownerUserId) as NoteRow | undefined;

  return row ? mapNote(row) : null;
}

export function getSharedNoteByToken(shareToken: string): NoteRecord | null {
  const row = db
    .prepare(
      `
      SELECT
        id,
        owner_user_id,
        title,
        content_json,
        is_shared,
        share_token,
        shared_at,
        created_at,
        updated_at
      FROM notes
      WHERE share_token = ? AND is_shared = 1
      `
    )
    .get(shareToken) as NoteRow | undefined;

  return row ? mapNote(row) : null;
}

export function createNote(input: NoteMutation): NoteRecord {
  parseContract(noteMutationContract, {
    title: input.title,
    contentJson: input.contentJson,
  });

  const noteId = randomUUID();
  const timestamp = nowIso();

  db.prepare(
    `
    INSERT INTO notes (
      id,
      owner_user_id,
      title,
      content_json,
      is_shared,
      share_token,
      shared_at,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, 0, NULL, NULL, ?, ?)
    `
  ).run(
    noteId,
    input.ownerUserId,
    input.title.trim(),
    input.contentJson,
    timestamp,
    timestamp
  );

  return getNoteById(noteId, input.ownerUserId)!;
}

export function updateNote(
  input: NoteTarget & Pick<NoteMutation, "title" | "contentJson">
): NoteRecord | null {
  parseContract(noteMutationContract, {
    title: input.title,
    contentJson: input.contentJson,
  });

  const timestamp = nowIso();

  const result = db
    .prepare(
      `
      UPDATE notes
      SET title = ?, content_json = ?, updated_at = ?
      WHERE id = ? AND owner_user_id = ?
      `
    )
    .run(
      input.title.trim(),
      input.contentJson,
      timestamp,
      input.noteId,
      input.ownerUserId
    );

  if (hasNoChanges(result)) {
    return null;
  }

  return getNoteById(input.noteId, input.ownerUserId);
}

export function deleteNote(input: NoteTarget): boolean {
  const result = db
    .prepare("DELETE FROM notes WHERE id = ? AND owner_user_id = ?")
    .run(input.noteId, input.ownerUserId);

  return !hasNoChanges(result);
}

function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

export function listNotes(
  ownerUserId: string,
  options: ListNotesOptions = {}
): NoteRecord[] {
  const titleQuery = options.titleQuery?.trim();
  const hasTitleQuery = Boolean(titleQuery);
  const sql = hasTitleQuery
    ? `
      SELECT
        id,
        owner_user_id,
        title,
        content_json,
        is_shared,
        share_token,
        shared_at,
        created_at,
        updated_at
      FROM notes
      WHERE owner_user_id = ?
        AND LOWER(title) LIKE LOWER(?) ESCAPE '\\'
      ORDER BY updated_at DESC, created_at DESC, id DESC
      `
    : `
      SELECT
        id,
        owner_user_id,
        title,
        content_json,
        is_shared,
        share_token,
        shared_at,
        created_at,
        updated_at
      FROM notes
      WHERE owner_user_id = ?
      ORDER BY updated_at DESC, created_at DESC, id DESC
      `;
  const rows = hasTitleQuery
    ? (db
        .prepare(sql)
        .all(ownerUserId, `%${escapeLikePattern(titleQuery!)}%`) as NoteRow[])
    : (db.prepare(sql).all(ownerUserId) as NoteRow[]);

  return rows.map(mapNote);
}

export function enableShare(input: NoteTarget): NoteRecord | null {
  const shareToken = createShareToken();
  const timestamp = nowIso();

  const result = db
    .prepare(
      `
      UPDATE notes
      SET
        is_shared = 1,
        share_token = ?,
        shared_at = ?,
        updated_at = ?
      WHERE id = ? AND owner_user_id = ?
      `
    )
    .run(
      shareToken,
      timestamp,
      timestamp,
      input.noteId,
      input.ownerUserId
    );

  if (hasNoChanges(result)) {
    return null;
  }

  return getNoteById(input.noteId, input.ownerUserId);
}

export function disableShare(input: NoteTarget): NoteRecord | null {
  const timestamp = nowIso();

  const result = db
    .prepare(
      `
      UPDATE notes
      SET
        is_shared = 0,
        share_token = NULL,
        shared_at = NULL,
        updated_at = ?
      WHERE id = ? AND owner_user_id = ?
      `
    )
    .run(timestamp, input.noteId, input.ownerUserId);

  if (hasNoChanges(result)) {
    return null;
  }

  return getNoteById(input.noteId, input.ownerUserId);
}

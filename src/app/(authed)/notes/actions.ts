"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createNote,
  deleteNote,
  disableShare,
  enableShare,
  updateNote,
} from "../../../db/notes-repo";
import { getSession } from "../../../lib/session";

function getRequiredString(formData: FormData, key: string): string {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing required field: ${key}`);
  }
  return value.trim();
}

async function requireUserId() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session.user.id;
}

export async function createNoteAction(formData: FormData) {
  const ownerUserId = await requireUserId();
  const title = getRequiredString(formData, "title");
  const contentJson = getRequiredString(formData, "contentJson");

  const note = createNote({ ownerUserId, title, contentJson });

  revalidatePath("/notes");
  redirect(`/notes/${note.id}`);
}

export async function updateNoteAction(formData: FormData) {
  const ownerUserId = await requireUserId();
  const noteId = getRequiredString(formData, "noteId");
  const title = getRequiredString(formData, "title");
  const contentJson = getRequiredString(formData, "contentJson");

  const note = updateNote({ noteId, ownerUserId, title, contentJson });
  if (!note) {
    throw new Error("Note not found.");
  }

  revalidatePath("/notes");
  revalidatePath(`/notes/${noteId}`);
  if (note.shareToken) {
    revalidatePath(`/s/${note.shareToken}`);
  }
  redirect(`/notes/${noteId}`);
}

export async function deleteNoteAction(formData: FormData) {
  const ownerUserId = await requireUserId();
  const noteId = getRequiredString(formData, "noteId");

  const deleted = deleteNote({ noteId, ownerUserId });
  if (!deleted) {
    throw new Error("Note not found.");
  }

  revalidatePath("/notes");
  redirect("/notes");
}

export async function enableShareAction(formData: FormData) {
  const ownerUserId = await requireUserId();
  const noteId = getRequiredString(formData, "noteId");

  const note = enableShare({ noteId, ownerUserId });
  if (!note) {
    throw new Error("Note not found.");
  }

  revalidatePath("/notes");
  revalidatePath(`/notes/${noteId}`);
  if (note.shareToken) {
    revalidatePath(`/s/${note.shareToken}`);
  }
  redirect(`/notes/${noteId}`);
}

export async function disableShareAction(formData: FormData) {
  const ownerUserId = await requireUserId();
  const noteId = getRequiredString(formData, "noteId");

  const note = disableShare({ noteId, ownerUserId });
  if (!note) {
    throw new Error("Note not found.");
  }

  revalidatePath("/notes");
  revalidatePath(`/notes/${noteId}`);
  redirect(`/notes/${noteId}`);
}

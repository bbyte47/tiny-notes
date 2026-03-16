import Link from "next/link";
import { redirect } from "next/navigation";
import { createNoteAction } from "../../(authed)/notes/actions";
import { getSession } from "../../../lib/session";
import { NoteEditorForm } from "../../components/NoteEditorForm";

export default async function NewNotePage() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <main>
      <h1>New Note</h1>
      <p>
        <Link href="/notes">Back to notes</Link>
      </p>
      <NoteEditorForm action={createNoteAction} submitLabel="Create Note" />
    </main>
  );
}

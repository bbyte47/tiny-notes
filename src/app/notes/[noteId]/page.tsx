import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  deleteNoteAction,
  disableShareAction,
  enableShareAction,
  updateNoteAction,
} from "../../(authed)/notes/actions";
import { getNoteById } from "../../../db/notes-repo";
import { getSession } from "../../../lib/session";
import { DeleteNoteButton } from "../../components/DeleteNoteButton";
import { NoteEditorForm } from "../../components/NoteEditorForm";
import { ShareControls } from "../../components/ShareControls";

type NotePageProps = {
  params: Promise<{ noteId: string }>;
};

export default async function NotePage({ params }: NotePageProps) {
  const { noteId } = await params;

  const session = await getSession();
  const userId = session?.user?.id;
  if (!userId) {
    redirect("/login");
  }

  const note = getNoteById(noteId, userId);
  if (!note) {
    notFound();
  }

  return (
    <main>
      <p>
        <Link href="/notes">Back to notes</Link>
      </p>
      <div className="note-page-header">
        <p className="note-page-eyebrow">Edit Note</p>
      </div>
      <NoteEditorForm
        action={updateNoteAction}
        noteId={note.id}
        initialTitle={note.title}
        initialContentJson={note.contentJson}
        submitLabel="Save"
        titleLabel="Note title"
        titleInline
      />
      <ShareControls
        noteId={note.id}
        isShared={note.isShared}
        shareToken={note.shareToken}
        enableAction={enableShareAction}
        disableAction={disableShareAction}
      />
      <DeleteNoteButton noteId={note.id} action={deleteNoteAction} />
    </main>
  );
}

import { notFound } from "next/navigation";
import { getSharedNoteByToken } from "../../../db/notes-repo";
import { renderSanitizedNoteHtml } from "../../../lib/note-content";

type SharedNotePageProps = {
  params: Promise<{ token: string }>;
};

export default async function SharedNotePage({ params }: SharedNotePageProps) {
  const { token } = await params;
  const note = getSharedNoteByToken(token);

  if (!note) {
    notFound();
  }

  const renderedContentHtml = renderSanitizedNoteHtml(note.contentJson);

  return (
    <main>
      <h1>{note.title}</h1>
      <article
        className="shared-note-content"
        dangerouslySetInnerHTML={{ __html: renderedContentHtml }}
      />
    </main>
  );
}

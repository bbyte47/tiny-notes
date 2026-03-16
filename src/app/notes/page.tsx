import Link from "next/link";
import { redirect } from "next/navigation";
import { signOutAction } from "../(auth)/actions";
import { listNotes } from "../../db/notes-repo";
import { getSession } from "../../lib/session";

const updatedAtFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatUpdatedAt(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return updatedAtFormatter.format(date);
}

export default async function NotesPage() {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const notes = listNotes(userId);

  return (
    <main>
      <h1>My Notes</h1>
      <form action={signOutAction}>
        <button type="submit">Sign Out</button>
      </form>
      <div className="notes-toolbar">
        <Link href="/notes/new" className="button-link primary">
          + New Note
        </Link>
      </div>
      {notes.length === 0 ? (
        <p className="notes-empty">No notes yet.</p>
      ) : (
        <ul className="notes-cards">
          {notes.map((note) => (
            <li key={note.id}>
              <Link href={`/notes/${note.id}`} className="note-card">
                <h2>{note.title}</h2>
                <p className="note-card-updated">Updated {formatUpdatedAt(note.updatedAt)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

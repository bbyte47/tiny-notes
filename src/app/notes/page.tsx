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

type NotesPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function NotesPage({ searchParams }: NotesPageProps) {
  const session = await getSession();
  const userId = session?.user?.id;
  const { q } = await searchParams;
  const titleQuery = typeof q === "string" ? q.trim() : "";

  if (!userId) {
    redirect("/login");
  }

  const notes = listNotes(userId, { titleQuery });

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
      <form className="notes-search-form">
        <label htmlFor="notes-search">Search titles</label>
        <div className="notes-search-row">
          <input
            id="notes-search"
            name="q"
            type="search"
            placeholder="Search notes by title"
            defaultValue={titleQuery}
          />
          <button type="submit">Search</button>
          {titleQuery ? (
            <Link href="/notes" className="button-link">
              Clear
            </Link>
          ) : null}
        </div>
      </form>
      {notes.length === 0 ? (
        <p className="notes-empty">
          {titleQuery ? "No notes match that search." : "No notes yet."}
        </p>
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

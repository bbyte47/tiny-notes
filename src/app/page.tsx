import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "../lib/session";

export default async function HomePage() {
  const session = await getSession();
  if (session?.user?.id) {
    redirect("/notes");
  }

  return (
    <main className="home-landing">
      <h1>TinyNotes</h1>
      <p>
        Capture quick thoughts, keep them organized, and share notes with secure links when
        needed.
      </p>
      <div className="home-actions">
        <Link href="/notes" className="button-link primary">
          Go to Notes
        </Link>
        <Link href="/login" className="button-link">
          Login
        </Link>
        <Link href="/signup" className="button-link">
          Signup
        </Link>
      </div>
    </main>
  );
}

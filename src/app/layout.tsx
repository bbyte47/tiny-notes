import type { Metadata } from "next";
import Link from "next/link";
import { signOutAction } from "./(auth)/actions";
import { getSession } from "../lib/session";
import "./globals.css";

export const metadata: Metadata = {
  title: "TinyNotes",
  description: "TinyNotes runtime bootstrap",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default async function RootLayout({ children }: RootLayoutProps) {
  const session = await getSession();
  const isAuthenticated = Boolean(session?.user?.id);

  return (
    <html lang="en">
      <body>
        <header className="app-nav">
          <div className="app-nav-inner">
            <Link href="/" className="app-brand">
              TinyNotes
            </Link>
            <nav className="app-nav-links" aria-label="Global navigation">
              <Link href="/notes">Notes</Link>
              {isAuthenticated ? (
                <form action={signOutAction} className="app-nav-logout-form">
                  <button type="submit" className="app-nav-logout-button">
                    Logout
                  </button>
                </form>
              ) : (
                <>
                  <Link href="/login">Login</Link>
                  <Link href="/signup">Signup</Link>
                </>
              )}
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}

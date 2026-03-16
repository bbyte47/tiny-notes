import { redirect } from "next/navigation";
import { getSession } from "../../lib/session";
import { LoginForm } from "../components/LoginForm";

export default async function LoginPage() {
  const session = await getSession();
  if (session?.user?.id) {
    redirect("/notes");
  }

  return (
    <main>
      <h1>Log In</h1>
      <LoginForm />
    </main>
  );
}

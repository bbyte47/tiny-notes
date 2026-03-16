import { redirect } from "next/navigation";
import { getSession } from "../../lib/session";
import { SignupForm } from "../components/SignupForm";

export default async function SignupPage() {
  const session = await getSession();
  if (session?.user?.id) {
    redirect("/notes");
  }

  return (
    <main>
      <h1>Sign Up</h1>
      <SignupForm />
    </main>
  );
}

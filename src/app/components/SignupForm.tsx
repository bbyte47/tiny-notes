import Link from "next/link";
import { signUpAction } from "../(auth)/actions";

export function SignupForm() {
  return (
    <>
      <form action={signUpAction}>
        <label htmlFor="name">Name</label>
        <input id="name" name="name" type="text" required />

        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required />

        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required />

        <button type="submit">Create Account</button>
      </form>
      <p>
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </>
  );
}

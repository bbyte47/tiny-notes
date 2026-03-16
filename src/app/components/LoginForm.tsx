"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { signInAction } from "../(auth)/actions";

const INITIAL_SIGN_IN_STATE = {
  status: "idle",
  message: null,
  email: "",
} as const;

export function LoginForm() {
  const [signInState, formAction, isPending] = useActionState(
    signInAction,
    INITIAL_SIGN_IN_STATE
  );
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (signInState.status === "error") {
      setEmail(signInState.email);
    }
  }, [signInState.email, signInState.status]);

  return (
    <>
      <form action={formAction}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required />

        {signInState.status === "error" ? (
          <p role="alert" className="form-error">
            {signInState.message}
          </p>
        ) : null}

        <button type="submit" disabled={isPending}>
          Log In
        </button>
      </form>
      <p>
        Need an account? <Link href="/signup">Sign up</Link>
      </p>
    </>
  );
}

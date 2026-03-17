"use server";

import { parseSetCookieHeader } from "better-auth/cookies";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "../../lib/auth";

type SignInActionResult = {
  status: "idle" | "error";
  message: string | null;
  email: string;
};

function getRequiredString(formData: FormData, key: string): string {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing required field: ${key}`);
  }
  return value.trim();
}

async function applySetCookieHeader(responseHeaders: Headers) {
  const setCookieHeader = responseHeaders.get("set-cookie");
  if (!setCookieHeader) {
    return;
  }

  const parsedCookies = parseSetCookieHeader(setCookieHeader);
  const cookieStore = await cookies();

  for (const [name, attributes] of parsedCookies.entries()) {
    cookieStore.set(name, attributes.value, {
      maxAge: attributes["max-age"],
      expires: attributes.expires,
      domain: attributes.domain,
      path: attributes.path,
      secure: attributes.secure,
      httpOnly: attributes.httponly,
      sameSite: attributes.samesite,
    });
  }
}

export async function signUpAction(formData: FormData) {
  const name = getRequiredString(formData, "name");
  const email = getRequiredString(formData, "email");
  const password = getRequiredString(formData, "password");

  const response = await auth.api.signUpEmail({
    body: { name, email, password },
    headers: await headers(),
    returnHeaders: true,
  });

  await applySetCookieHeader(response.headers);
  redirect("/notes");
}

export async function signInAction(
  _previousState: SignInActionResult,
  formData: FormData
): Promise<SignInActionResult> {
  const emailValue = formData.get("email");
  const passwordValue = formData.get("password");
  const email = typeof emailValue === "string" ? emailValue.trim() : "";
  const password = typeof passwordValue === "string" ? passwordValue : "";

  if (!email || !password) {
    return {
      status: "error",
      message: "Invalid email or password",
      email,
    };
  }

  try {
    const response = await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
      returnHeaders: true,
    });

    await applySetCookieHeader(response.headers);
    redirect("/notes");
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      error.name === "APIError"
    ) {
      return {
        status: "error",
        message: "Invalid email or password",
        email,
      };
    }

    return {
      status: "error",
      message: "Invalid email or password",
      email,
    };
  }
}

export async function signOutAction() {
  const response = await auth.api.signOut({
    headers: await headers(),
    returnHeaders: true,
  });

  await applySetCookieHeader(response.headers);
  redirect("/login");
}

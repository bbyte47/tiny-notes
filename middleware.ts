import { NextRequest, NextResponse } from "next/server";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function getAllowedOrigins(request: NextRequest): Set<string> {
  const origins = new Set<string>([request.nextUrl.origin]);
  const configuredBaseUrl = process.env.BETTER_AUTH_URL?.trim();

  if (configuredBaseUrl) {
    try {
      origins.add(new URL(configuredBaseUrl).origin);
    } catch {
      // Ignore invalid configuration and use request origin only.
    }
  }

  return origins;
}

function requestOrigin(request: NextRequest): string | null {
  const originHeader = request.headers.get("origin");
  if (originHeader) {
    return originHeader;
  }

  const refererHeader = request.headers.get("referer");
  if (!refererHeader) {
    return null;
  }

  try {
    return new URL(refererHeader).origin;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  if (!MUTATING_METHODS.has(request.method)) {
    return NextResponse.next();
  }

  const origin = requestOrigin(request);
  const allowedOrigins = getAllowedOrigins(request);

  if (!origin || !allowedOrigins.has(origin)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

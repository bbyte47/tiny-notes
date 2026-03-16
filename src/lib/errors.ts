export const ERROR_CODES = [
  "VALIDATION_ERROR",
  "UNAUTHENTICATED",
  "NOT_FOUND",
  "CONFLICT",
  "CSRF_INVALID",
  "INTERNAL_ERROR",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

const ERROR_STATUS: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHENTICATED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409,
  CSRF_INVALID: 403,
  INTERNAL_ERROR: 500,
};

export class AppError extends Error {
  code: ErrorCode;
  status: number;
  details: unknown;

  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = ERROR_STATUS[code];
    this.details = details;
  }
}

export function createError(
  code: ErrorCode,
  message: string,
  details?: unknown
): AppError {
  return new AppError(code, message, details);
}

export function toErrorResponse(error: unknown): Response {
  if (error instanceof AppError) {
    return Response.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details ?? null,
        },
      },
      { status: error.status }
    );
  }

  return Response.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred.",
        details: null,
      },
    },
    { status: 500 }
  );
}

import type { Contract } from "./contracts";
import { createError } from "./errors";

export function parseContract<T>(contract: Contract<T>, payload: unknown): T {
  if (!contract.validate(payload)) {
    throw createError(
      "VALIDATION_ERROR",
      `Payload does not satisfy contract: ${contract.name}`,
      { contract: contract.name }
    );
  }

  return payload;
}

export function validateContract<T>(
  contract: Contract<T>,
  payload: unknown
):
  | { ok: true; data: T }
  | {
      ok: false;
      error: {
        code: "VALIDATION_ERROR";
        message: string;
        details: { contract: string };
      };
    } {
  if (!contract.validate(payload)) {
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: `Payload does not satisfy contract: ${contract.name}`,
        details: { contract: contract.name },
      },
    };
  }

  return { ok: true, data: payload };
}

import { describe, expect, test } from "bun:test";
import { noteMutationContract } from "../src/lib/contracts";
import { createShareToken } from "../src/lib/token";
import { validateContract } from "../src/lib/validation";

describe("C8 smoke checks", () => {
  test("createShareToken returns a non-empty token", () => {
    const token = createShareToken();
    expect(token.length).toBeGreaterThan(0);
  });

  test("invalid payload returns VALIDATION_ERROR", () => {
    const result = validateContract(noteMutationContract, {
      title: "",
      contentJson: 123,
    });

    expect(result.ok).toBeFalse();
    if (!result.ok) {
      expect(result.error.code).toBe("VALIDATION_ERROR");
    }
  });
});

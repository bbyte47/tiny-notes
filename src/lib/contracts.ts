export type Validator<T> = (value: unknown) => value is T;

export type Contract<T> = {
  name: string;
  validate: Validator<T>;
};

export function isObject(
  value: unknown
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export type NoteMutationInput = {
  title: string;
  contentJson: string;
};

export const noteMutationContract: Contract<NoteMutationInput> = {
  name: "NoteMutationInput",
  validate(value: unknown): value is NoteMutationInput {
    if (!isObject(value)) {
      return false;
    }

    return (
      isNonEmptyString(value.title) &&
      typeof value.contentJson === "string"
    );
  },
};

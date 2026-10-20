const POSTGRES_UNIQUE_VIOLATION: string = "23505";
const POSTGRES_FOREIGN_KEY_VIOLATIONS: readonly string[] = ["23503", "23001"];
const MAX_CAUSE_DEPTH: number = 3;

function extractPostgresCode(
  error: unknown,
  depth: number = 0,
): string | undefined {
  if (depth > MAX_CAUSE_DEPTH || typeof error !== "object" || error === null) {
    return undefined;
  }

  if ("code" in error && typeof error.code === "string") {
    return error.code;
  }

  if ("driverError" in error) {
    return extractPostgresCode(error.driverError, depth + 1);
  }

  return undefined;
}

export function isUniqueViolation(error: unknown): boolean {
  return extractPostgresCode(error) === POSTGRES_UNIQUE_VIOLATION;
}

export function isForeignKeyViolation(error: unknown): boolean {
  const code: string | undefined = extractPostgresCode(error);

  return code !== undefined && POSTGRES_FOREIGN_KEY_VIOLATIONS.includes(code);
}

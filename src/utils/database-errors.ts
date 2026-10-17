import { QueryFailedError } from "typeorm";

const POSTGRES_UNIQUE_VIOLATION: string = "23505";
const POSTGRES_FOREIGN_KEY_VIOLATION: string = "23503";

function hasPostgresCode(error: unknown, code: string): boolean {
  if (!(error instanceof QueryFailedError)) {
    return false;
  }

  const driverError: unknown = error.driverError;

  return (
    typeof driverError === "object" &&
    driverError !== null &&
    "code" in driverError &&
    driverError.code === code
  );
}

export function isUniqueViolation(error: unknown): boolean {
  return hasPostgresCode(error, POSTGRES_UNIQUE_VIOLATION);
}

export function isForeignKeyViolation(error: unknown): boolean {
  return hasPostgresCode(error, POSTGRES_FOREIGN_KEY_VIOLATION);
}

import { QueryFailedError } from "typeorm";

const POSTGRES_UNIQUE_VIOLATION: string = "23505";

export function isUniqueViolation(error: unknown): boolean {
  if (!(error instanceof QueryFailedError)) {
    return false;
  }

  const driverError: unknown = error.driverError;

  return (
    typeof driverError === "object" &&
    driverError !== null &&
    "code" in driverError &&
    driverError.code === POSTGRES_UNIQUE_VIOLATION
  );
}

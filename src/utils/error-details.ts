export interface ErrorDetails {
  message: string;
  stack?: string | undefined;
}

export function getErrorDetails(error: unknown): ErrorDetails {
  if (error instanceof Error) {
    return { message: error.message, stack: error.stack };
  }

  return { message: String(error) };
}

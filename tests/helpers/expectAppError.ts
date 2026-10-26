import { AppError } from "../../src/errors/AppError";

export async function expectAppError(
  action: Promise<unknown>,
  statusCode: number,
  message?: string,
): Promise<void> {
  await expect(action).rejects.toBeInstanceOf(AppError);
  await expect(action).rejects.toMatchObject(
    message === undefined ? { statusCode } : { statusCode, message },
  );
}

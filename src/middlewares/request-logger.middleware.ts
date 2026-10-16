import { NextFunction, Request, Response } from "express";

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const startedAt: bigint = process.hrtime.bigint();

  res.on("finish", (): void => {
    const durationMs: number =
      Number(process.hrtime.bigint() - startedAt) / 1_000_000;

    // TODO 3: descobrir a rota (template, sem valores reais)
    // TODO 4: chamar logger.http(...) com method, route, statusCode e durationMs
  });

  next();
}

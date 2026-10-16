import { NextFunction, Request, Response } from "express";

import { logger } from "../config/logger";
import { getRouteTemplate } from "../utils/request";

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const startedAt: bigint = process.hrtime.bigint();

  res.on("finish", (): void => {
    const durationMs: number =
      Number(process.hrtime.bigint() - startedAt) / 1_000_000;

    logger.http("requisição HTTP", {
      method: req.method,
      route: getRouteTemplate(req),
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
    });
  });

  next();
}

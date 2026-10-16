import { Request, Response } from "express";
import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";

import { env } from "../config/env";
import { logger } from "../config/logger";

function createRateLimiter(
  scope: string,
  maxRequests: number,
): RateLimitRequestHandler {
  const windowMinutes: number = Math.ceil(env.rateLimitWindowMs / 60_000);

  return rateLimit({
    windowMs: env.rateLimitWindowMs,
    limit: maxRequests,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: (req: Request, res: Response): void => {
      logger.warn("limite de requisições excedido", {
        scope,
        method: req.method,
        path: req.path,
        ip: req.ip,
      });

      res.status(429).json({
        status: "error",
        message: `Limite de ${maxRequests} requisições a cada ${windowMinutes} minuto(s) excedido. Tente novamente mais tarde.`,
      });
    },
  });
}

export const globalRateLimiter: RateLimitRequestHandler = createRateLimiter(
  "global",
  env.rateLimitMax,
);

export const authRateLimiter: RateLimitRequestHandler = createRateLimiter(
  "auth",
  env.authRateLimitMax,
);

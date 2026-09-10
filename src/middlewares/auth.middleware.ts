import { NextFunction, Request, Response } from "express";

import { AppError } from "../errors/AppError";
import { verifyToken } from "../utils/jwt";

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const authorization = req.headers.authorization;

  if (!authorization) {
    throw new AppError("Token de autenticação não informado.", 401);
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new AppError("Token de autenticação inválido.", 401);
  }

  try {
    const decoded = verifyToken(token);

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch {
    throw new AppError("Token de autenticação inválido ou expirado.", 401);
  }
}

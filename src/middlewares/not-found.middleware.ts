import { NextFunction, Request, Response } from "express";

import { AppError } from "../errors/AppError";

export function notFoundMiddleware(
  _req: Request,
  _res: Response,
  next: NextFunction,
): void {
  next(new AppError("Rota não encontrada.", 404));
}

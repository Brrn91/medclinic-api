import { NextFunction, Request, Response } from "express";

export function captureRouteBase(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  res.locals.routeBase = req.baseUrl;

  next();
}

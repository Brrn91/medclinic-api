import { NextFunction, Request, Response } from "express";

import { AppError } from "../errors/AppError";

interface ErrorResponse {
  status: "error";
  message: string;
}

export function errorMiddleware(
  error: unknown,
  _request: Request,
  response: Response<ErrorResponse>,
  _next: NextFunction,
): Response<ErrorResponse> {
  if (error instanceof AppError) {
    return response.status(error.statusCode).json({
      status: "error",
      message: error.message,
    });
  }

  console.error("Erro não tratado:", error);

  return response.status(500).json({
    status: "error",
    message: "Erro interno do servidor",
  });
}

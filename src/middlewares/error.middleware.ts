import { NextFunction, Request, Response } from "express";

import { AppError } from "../errors/AppError";

interface ErrorResponse {
  status: "error";
  message: string;
}

interface JsonParseError extends SyntaxError {
  status?: number;
  statusCode?: number;
  type?: string;
  body?: unknown;
}

function isJsonParseError(error: unknown): error is JsonParseError {
  return error instanceof SyntaxError && "status" in error && "body" in error;
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

  if (isJsonParseError(error)) {
    return response.status(400).json({
      status: "error",
      message: "Corpo da requisição em formato JSON inválido.",
    });
  }

  console.error("Erro não tratado:", error);

  return response.status(500).json({
    status: "error",
    message: "Erro interno do servidor",
  });
}

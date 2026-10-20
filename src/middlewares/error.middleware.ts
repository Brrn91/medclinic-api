import { NextFunction, Request, Response } from "express";

import { logger } from "../config/logger";
import { AppError } from "../errors/AppError";
import { getErrorDetails } from "../utils/error-details";
import { getRouteTemplate } from "../utils/request";

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
  request: Request,
  response: Response<ErrorResponse>,
  _next: NextFunction,
): Response<ErrorResponse> {
  const context = {
    method: request.method,
    route: getRouteTemplate(request),
    userId: request.user?.id,
  };

  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      logger.error(error.message, { ...context, statusCode: error.statusCode });
    } else {
      logger.warn(error.message, { ...context, statusCode: error.statusCode });
    }

    return response.status(error.statusCode).json({
      status: "error",
      message: error.message,
    });
  }

  if (isJsonParseError(error)) {
    logger.warn("Corpo da requisição em formato JSON inválido", {
      ...context,
      statusCode: 400,
    });

    return response.status(400).json({
      status: "error",
      message: "Corpo da requisição em formato JSON inválido.",
    });
  }

  logger.error("Erro não tratado", {
    ...context,
    statusCode: 500,
    ...getErrorDetails(error),
  });

  return response.status(500).json({
    status: "error",
    message: "Erro interno do servidor",
  });
}

import cors, { CorsOptions } from "cors";
import { RequestHandler } from "express";

import { AppError } from "../errors/AppError";
import { env } from "./env";

const corsOptions: CorsOptions = {
  origin: (origin, callback): void => {
    if (!origin || env.corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new AppError("Origem não permitida pelo CORS.", 403));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

export const corsMiddleware: RequestHandler = cors(corsOptions);

import express, { Application, Request, Response } from "express";

import { corsMiddleware } from "./config/cors";
import { errorMiddleware } from "./middlewares/error.middleware";
import { notFoundMiddleware } from "./middlewares/not-found.middleware";
import { globalRateLimiter } from "./middlewares/rate-limiter.middleware";
import { requestLogger } from "./middlewares/request-logger.middleware";
import adminRoutes from "./routes/admin.routes";
import authRoutes from "./routes/auth.routes";
import especialidadeRoutes from "./routes/especialidade.routes";
import userRoutes from "./routes/user.routes";

const app: Application = express();

app.use(corsMiddleware);
app.use(globalRateLimiter);
app.use(requestLogger);
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/admin", adminRoutes);
app.use("/especialidades", especialidadeRoutes);

app.get("/health", (_request: Request, response: Response): Response => {
  return response.status(200).json({
    status: "ok",
    message: "MedClinic API está em funcionamento",
  });
});

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;

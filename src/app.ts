import express, { Application, Request, Response } from "express";

import { corsMiddleware } from "./config/cors";
import { swaggerHandlers } from "./config/swagger";
import { errorMiddleware } from "./middlewares/error.middleware";
import { notFoundMiddleware } from "./middlewares/not-found.middleware";
import { globalRateLimiter } from "./middlewares/rate-limiter.middleware";
import { requestLogger } from "./middlewares/request-logger.middleware";
import { captureRouteBase } from "./middlewares/route-base.middleware";
import adminRoutes from "./routes/admin.routes";
import authRoutes from "./routes/auth.routes";
import consultaRoutes from "./routes/consulta.routes";
import especialidadeRoutes from "./routes/especialidade.routes";
import medicoRoutes from "./routes/medico.routes";
import pacienteRoutes from "./routes/paciente.routes";
import relatorioRoutes from "./routes/relatorio.routes";
import userRoutes from "./routes/user.routes";

const app: Application = express();

app.use(corsMiddleware);
app.use(globalRateLimiter);
app.use(requestLogger);
app.use(express.json());

app.use("/auth", captureRouteBase, authRoutes);
app.use("/users", captureRouteBase, userRoutes);
app.use("/admin", captureRouteBase, adminRoutes);
app.use("/especialidades", captureRouteBase, especialidadeRoutes);
app.use("/medicos", captureRouteBase, medicoRoutes);
app.use("/pacientes", captureRouteBase, pacienteRoutes);
app.use("/consultas", captureRouteBase, consultaRoutes);
app.use("/relatorios", captureRouteBase, relatorioRoutes);

app.use("/api-docs", ...swaggerHandlers);

app.get("/health", (_request: Request, response: Response): Response => {
  return response.status(200).json({
    status: "ok",
    message: "MedClinic API está em funcionamento",
  });
});

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;

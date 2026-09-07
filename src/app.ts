import express, { Application, Request, Response } from "express";
import authRoutes from "./routes/auth.routes";

const app: Application = express();

app.use(express.json());
app.use("/auth", authRoutes);

app.get("/health", (_request: Request, response: Response): Response => {
  return response.status(200).json({
    status: "ok",
    message: "MedClinic API está em funcionamento",
  });
});

export default app;

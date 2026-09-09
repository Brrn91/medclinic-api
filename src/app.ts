import express, { Application, Request, Response } from "express";
import { errorMiddleware } from "./middlewares/error.middleware";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";

const app: Application = express();

app.use(express.json());
app.use("/auth", authRoutes);
app.use("/users", userRoutes);

app.get("/health", (_request: Request, response: Response): Response => {
  return response.status(200).json({
    status: "ok",
    message: "MedClinic API está em funcionamento",
  });
});

app.use(errorMiddleware);

export default app;

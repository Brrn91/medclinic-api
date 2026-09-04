import express, { Application, Request, Response } from "express";

const app: Application = express();

app.use(express.json());

app.get("/health", (_request: Request, response: Response): Response => {
  return response.status(200).json({
    status: "ok",
    message: "MedClinic API está em funcionamento",
  });
});

export default app;

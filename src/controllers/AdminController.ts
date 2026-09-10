import { Request, Response } from "express";

export class AdminController {
  public ping = (_request: Request, response: Response): void => {
    response.status(200).json({
      status: "ok",
      message: "Acesso administrativo autorizado.",
    });
  };
}

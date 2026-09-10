import { NextFunction, Request, Response } from "express";

import { UserResponseDTO } from "../dtos/user/UserResponseDTO";
import { AppError } from "../errors/AppError";
import { UserService } from "../services/UserService";

export class UserController {
  private readonly userService: UserService;

  public constructor() {
    this.userService = new UserService();
  }

  public me = async (
    request: Request,
    response: Response<UserResponseDTO>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!request.user) {
        throw new AppError("Usuário não autenticado.", 401);
      }

      const user: UserResponseDTO = await this.userService.findById(
        request.user.id,
      );

      response.status(200).json(user);
    } catch (error: unknown) {
      next(error);
    }
  };
}

import { NextFunction, Request, Response } from "express";

import { RegisterUserDTO } from "../dtos/auth/RegisterUserDTO";
import { UserResponseDTO } from "../dtos/user/UserResponseDTO";
import { AuthService } from "../services/AuthService";

export class AuthController {
  private readonly authService: AuthService;

  public constructor() {
    this.authService = new AuthService();
  }

  public register = async (
    request: Request<Record<string, never>, UserResponseDTO, RegisterUserDTO>,
    response: Response<UserResponseDTO>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user: UserResponseDTO = await this.authService.register(
        request.body,
      );

      response.status(201).json(user);
    } catch (error: unknown) {
      next(error);
    }
  };
}

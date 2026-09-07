import { AuthResponseDTO } from "../dtos/auth/AuthResponseDTO";
import { LoginDTO } from "../dtos/auth/LoginDTO";
import { RegisterUserDTO } from "../dtos/auth/RegisterUserDTO";
import { UserResponseDTO } from "../dtos/user/UserResponseDTO";
import { User, UserRole } from "../entities/User";
import { AppError } from "../errors/AppError";
import { UserRepository } from "../repositories/UserRepository";
import { generateToken } from "../utils/jwt";
import { comparePassword, hashPassword } from "../utils/password";

export class AuthService {
  private readonly userRepository: UserRepository;

  public constructor() {
    this.userRepository = new UserRepository();
  }

  public async register(data: RegisterUserDTO): Promise<UserResponseDTO> {
    const name: string | undefined = data.name?.trim();
    const email: string | undefined = data.email?.trim().toLowerCase();
    const password: string | undefined = data.password;
    const role: UserRole | undefined = data.role;

    if (!name || !email || !password || !role) {
      throw new AppError("Todos os campos são obrigatórios", 400);
    }

    if (!this.isValidEmail(email)) {
      throw new AppError("E-mail inválido", 400);
    }

    if (password.length < 8) {
      throw new AppError("A senha deve possuir pelo menos 8 caracteres", 400);
    }

    if (!Object.values(UserRole).includes(role)) {
      throw new AppError("Perfil de acesso inválido", 400);
    }

    const existingUser: User | null =
      await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new AppError("E-mail já cadastrado", 409);
    }

    const passwordHash: string = await hashPassword(password);

    const user: User = await this.userRepository.create(
      {
        name,
        email,
        password,
        role,
      },
      passwordHash,
    );

    return this.toUserResponse(user);
  }

  public async login(data: LoginDTO): Promise<AuthResponseDTO> {
    const email: string | undefined = data.email?.trim().toLowerCase();
    const password: string | undefined = data.password;

    if (!email || !password) {
      throw new AppError("E-mail e senha são obrigatórios", 400);
    }

    const user: User | null = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new AppError("Credenciais inválidas", 401);
    }

    const passwordMatches: boolean = await comparePassword(
      password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new AppError("Credenciais inválidas", 401);
    }

    const token: string = generateToken({
      id: user.id,
      role: user.role,
    });

    return {
      token,
      user: this.toUserResponse(user),
    };
  }

  private isValidEmail(email: string): boolean {
    const emailPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(email);
  }

  private toUserResponse(user: User): UserResponseDTO {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}

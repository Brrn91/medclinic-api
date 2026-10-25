import { logger } from "../../src/config/logger";
import { RegisterUserDTO } from "../../src/dtos/auth/RegisterUserDTO";
import { User, UserRole } from "../../src/entities/User";
import { UserRepository } from "../../src/repositories/UserRepository";
import { AuthService } from "../../src/services/AuthService";
import { generateToken } from "../../src/utils/jwt";
import { comparePassword, hashPassword } from "../../src/utils/password";
import { expectAppError } from "../helpers/expectAppError";

jest.mock("../../src/repositories/UserRepository", () => ({
  UserRepository: jest.fn(),
}));
jest.mock("../../src/utils/jwt", () => ({ generateToken: jest.fn() }));
jest.mock("../../src/utils/password", () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
}));
jest.mock("../../src/config/logger", () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

const userRepositoryMock = {
  findByEmail: jest.fn<Promise<User | null>, [string]>(),
  create: jest.fn<
    Promise<User>,
    [Pick<RegisterUserDTO, "name" | "email">, string]
  >(),
};

const mockedHashPassword = jest.mocked(hashPassword);
const mockedComparePassword = jest.mocked(comparePassword);
const mockedGenerateToken = jest.mocked(generateToken);

function createUser(overrides: Partial<User> = {}): User {
  return {
    id: "user-1",
    name: "Ana Atendente",
    email: "ana@medclinic.com",
    passwordHash: "hash-da-senha",
    role: UserRole.ATTENDANT,
    createdAt: new Date("2026-10-01T10:00:00.000Z"),
    ...overrides,
  };
}

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(() => {
    jest
      .mocked(UserRepository)
      .mockImplementation(() => userRepositoryMock as unknown as UserRepository);

    service = new AuthService();
  });

  describe("register", () => {
    it("cadastra o usuário com a senha criptografada e sem expor a senha", async () => {
      userRepositoryMock.findByEmail.mockResolvedValue(null);
      mockedHashPassword.mockResolvedValue("hash-da-senha");
      userRepositoryMock.create.mockResolvedValue(createUser());

      const result = await service.register({
        name: "Ana Atendente",
        email: "ana@medclinic.com",
        password: "senha12345",
      });

      expect(mockedHashPassword).toHaveBeenCalledWith("senha12345");
      expect(userRepositoryMock.create).toHaveBeenCalledWith(
        { name: "Ana Atendente", email: "ana@medclinic.com" },
        "hash-da-senha",
      );
      expect(result.role).toBe(UserRole.ATTENDANT);
      expect(result).not.toHaveProperty("password");
      expect(result).not.toHaveProperty("passwordHash");
    });

    it("normaliza o nome e o e-mail antes de consultar e gravar", async () => {
      userRepositoryMock.findByEmail.mockResolvedValue(null);
      mockedHashPassword.mockResolvedValue("hash-da-senha");
      userRepositoryMock.create.mockResolvedValue(createUser());

      await service.register({
        name: "  Ana Atendente  ",
        email: "  ANA@MedClinic.com ",
        password: "senha12345",
      });

      expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith(
        "ana@medclinic.com",
      );
      expect(userRepositoryMock.create).toHaveBeenCalledWith(
        { name: "Ana Atendente", email: "ana@medclinic.com" },
        "hash-da-senha",
      );
    });

    it.each([
      ["nome", { name: "", email: "ana@medclinic.com", password: "senha12345" }],
      ["e-mail", { name: "Ana", email: "", password: "senha12345" }],
      ["senha", { name: "Ana", email: "ana@medclinic.com", password: "" }],
    ])("rejeita o cadastro sem %s com 400", async (_campo, data) => {
      await expectAppError(
        service.register(data),
        400,
        "Todos os campos são obrigatórios",
      );

      expect(userRepositoryMock.create).not.toHaveBeenCalled();
    });

    it("rejeita e-mail em formato inválido com 400", async () => {
      await expectAppError(
        service.register({
          name: "Ana",
          email: "isso-nao-e-email",
          password: "senha12345",
        }),
        400,
        "E-mail inválido",
      );
    });

    it("rejeita senha com menos de 8 caracteres com 400", async () => {
      await expectAppError(
        service.register({
          name: "Ana",
          email: "ana@medclinic.com",
          password: "curta",
        }),
        400,
        "A senha deve possuir pelo menos 8 caracteres",
      );

      expect(mockedHashPassword).not.toHaveBeenCalled();
    });

    it("rejeita e-mail já cadastrado com 409 e não grava nem criptografa nada", async () => {
      userRepositoryMock.findByEmail.mockResolvedValue(createUser());

      await expectAppError(
        service.register({
          name: "Outra Ana",
          email: "ana@medclinic.com",
          password: "senha12345",
        }),
        409,
        "E-mail já cadastrado",
      );

      expect(mockedHashPassword).not.toHaveBeenCalled();
      expect(userRepositoryMock.create).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("retorna o token e o usuário, sem expor o hash, em um login válido", async () => {
      const admin: User = createUser({ id: "admin-1", role: UserRole.ADMIN });
      userRepositoryMock.findByEmail.mockResolvedValue(admin);
      mockedComparePassword.mockResolvedValue(true);
      mockedGenerateToken.mockReturnValue("token-jwt");

      const result = await service.login({
        email: " ADMIN@medclinic.com ",
        password: "senha12345",
      });

      expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith(
        "admin@medclinic.com",
      );
      expect(mockedComparePassword).toHaveBeenCalledWith(
        "senha12345",
        "hash-da-senha",
      );
      expect(mockedGenerateToken).toHaveBeenCalledWith({
        id: "admin-1",
        role: UserRole.ADMIN,
      });
      expect(result.token).toBe("token-jwt");
      expect(result.user).not.toHaveProperty("passwordHash");
      expect(logger.info).toHaveBeenCalledWith(
        "login realizado com sucesso",
        expect.objectContaining({ userId: "admin-1" }),
      );
    });

    it("rejeita e-mail inexistente com 401, sem verificar senha nem emitir token", async () => {
      userRepositoryMock.findByEmail.mockResolvedValue(null);

      await expectAppError(
        service.login({ email: "ninguem@medclinic.com", password: "senha12345" }),
        401,
        "Credenciais inválidas",
      );

      expect(mockedComparePassword).not.toHaveBeenCalled();
      expect(mockedGenerateToken).not.toHaveBeenCalled();
    });

    it("rejeita senha incorreta com 401 e a mesma mensagem, sem emitir token", async () => {
      userRepositoryMock.findByEmail.mockResolvedValue(createUser());
      mockedComparePassword.mockResolvedValue(false);

      await expectAppError(
        service.login({ email: "ana@medclinic.com", password: "senha-errada" }),
        401,
        "Credenciais inválidas",
      );

      expect(mockedGenerateToken).not.toHaveBeenCalled();
      expect(logger.info).not.toHaveBeenCalled();
    });

    it("rejeita login sem e-mail ou sem senha com 400", async () => {
      await expectAppError(
        service.login({ email: "", password: "senha12345" }),
        400,
        "E-mail e senha são obrigatórios",
      );
      await expectAppError(
        service.login({ email: "ana@medclinic.com", password: "" }),
        400,
        "E-mail e senha são obrigatórios",
      );

      expect(userRepositoryMock.findByEmail).not.toHaveBeenCalled();
    });
  });
});

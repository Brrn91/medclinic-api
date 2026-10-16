import { env } from "../../config/env";
import { logger } from "../../config/logger";
import { User, UserRole } from "../../entities/User";
import { UserRepository } from "../../repositories/UserRepository";
import { getErrorDetails } from "../../utils/error-details";
import { hashPassword } from "../../utils/password";
import { AppDataSource } from "../data-source";

interface SeedAdminData {
  name: string;
  email: string;
  password: string;
}

function getSeedAdminData(): SeedAdminData {
  const name: string | undefined = env.seedAdminName?.trim();
  const email: string | undefined = env.seedAdminEmail?.trim().toLowerCase();
  const password: string | undefined = env.seedAdminPassword;

  if (!name || !email || !password) {
    throw new Error(
      "Defina SEED_ADMIN_NAME, SEED_ADMIN_EMAIL e SEED_ADMIN_PASSWORD no .env",
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("SEED_ADMIN_EMAIL não é um e-mail válido");
  }

  if (password.length < 8) {
    throw new Error("SEED_ADMIN_PASSWORD deve ter pelo menos 8 caracteres");
  }

  return { name, email, password };
}

async function seedAdmin(): Promise<void> {
  const data: SeedAdminData = getSeedAdminData();

  await AppDataSource.initialize();

  try {
    const userRepository: UserRepository = new UserRepository();
    const existingUser: User | null = await userRepository.findByEmail(
      data.email,
    );

    if (existingUser) {
      if (existingUser.role === UserRole.ADMIN) {
        logger.info("seed: administrador já existe, nada a fazer", {
          email: data.email,
        });
      } else {
        logger.warn(
          "seed: e-mail já cadastrado com outro perfil, nada foi alterado",
          {
            email: data.email,
            role: existingUser.role,
          },
        );
      }

      return;
    }

    const passwordHash: string = await hashPassword(data.password);

    const admin: User = await userRepository.create(
      { name: data.name, email: data.email },
      passwordHash,
      UserRole.ADMIN,
    );

    logger.info("seed: administrador inicial criado", {
      userId: admin.id,
      email: admin.email,
    });
  } finally {
    await AppDataSource.destroy();
  }
}

seedAdmin().catch((error: unknown): void => {
  logger.error(
    "seed: falha ao criar administrador inicial",
    getErrorDetails(error),
  );
  process.exitCode = 1;
});

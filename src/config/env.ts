import "dotenv/config";

interface EnvironmentVariables {
  port: number;
  dbHost: string;
  dbPort: number;
  dbName: string;
  dbUser: string;
  dbPassword: string;
  jwtSecret: string;
  jwtExpiresIn: string;
}

function getRequiredEnv(name: string): string {
  const value: string | undefined = process.env[name];

  if (!value) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  }

  return value;
}

function getPort(name: string): number {
  const value: number = Number(getRequiredEnv(name));

  if (!Number.isInteger(value) || value < 1 || value > 65535) {
    throw new Error(`A variável ${name} deve ser uma porta válida`);
  }

  return value;
}

export const env: EnvironmentVariables = {
  port: getPort("PORT"),
  dbHost: getRequiredEnv("DB_HOST"),
  dbPort: getPort("DB_PORT"),
  dbName: getRequiredEnv("DB_NAME"),
  dbUser: getRequiredEnv("DB_USER"),
  dbPassword: getRequiredEnv("DB_PASSWORD"),
  jwtSecret: getRequiredEnv("JWT_SECRET"),
  jwtExpiresIn: getRequiredEnv("JWT_EXPIRES_IN"),
};

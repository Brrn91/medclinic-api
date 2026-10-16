import "dotenv/config";

interface EnvironmentVariables {
  logLevel: LogLevel;
  port: number;
  dbHost: string;
  dbPort: number;
  dbName: string;
  dbUser: string;
  dbPassword: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  corsOrigins: string[];
  rateLimitWindowMs: number;
  rateLimitMax: number;
  authRateLimitMax: number;
  seedAdminName: string | undefined;
  seedAdminEmail: string | undefined;
  seedAdminPassword: string | undefined;
}

const LOG_LEVELS = ["error", "warn", "info", "http", "debug"] as const;
type LogLevel = (typeof LOG_LEVELS)[number];

function isLogLevel(value: string): value is LogLevel {
  return (LOG_LEVELS as readonly string[]).includes(value);
}

function getRequiredEnv(name: string): string {
  const value: string | undefined = process.env[name];

  if (!value) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  }

  return value;
}

function getOptionalEnv(name: string): string | undefined {
  const value: string | undefined = process.env[name];

  return value && value.length > 0 ? value : undefined;
}

function getLogLevel(name: string, fallback: LogLevel): LogLevel {
  const value: string = process.env[name] ?? fallback;

  if (!isLogLevel(value)) {
    throw new Error(
      `A variável ${name} deve ser um de: ${LOG_LEVELS.join(", ")}`,
    );
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

function getPositiveInt(name: string, fallback: number): number {
  const raw: string | undefined = process.env[name];

  if (raw === undefined || raw === "") {
    return fallback;
  }

  const value: number = Number(raw);

  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`A variável ${name} deve ser um inteiro positivo`);
  }

  return value;
}

function getOrigins(name: string): string[] {
  const origins: string[] = getRequiredEnv(name)
    .split(",")
    .map((origin: string): string => origin.trim())
    .filter((origin: string): boolean => origin.length > 0);

  if (origins.length === 0 || origins.includes("*")) {
    throw new Error(
      `A variável ${name} deve listar origens explícitas, sem "*"`,
    );
  }

  return origins;
}

export const env: EnvironmentVariables = {
  logLevel: getLogLevel("LOG_LEVEL", "info"),
  port: getPort("PORT"),
  dbHost: getRequiredEnv("DB_HOST"),
  dbPort: getPort("DB_PORT"),
  dbName: getRequiredEnv("DB_NAME"),
  dbUser: getRequiredEnv("DB_USER"),
  dbPassword: getRequiredEnv("DB_PASSWORD"),
  jwtSecret: getRequiredEnv("JWT_SECRET"),
  jwtExpiresIn: getRequiredEnv("JWT_EXPIRES_IN"),
  corsOrigins: getOrigins("CORS_ORIGINS"),
  rateLimitWindowMs: getPositiveInt("RATE_LIMIT_WINDOW_MS", 900_000),
  rateLimitMax: getPositiveInt("RATE_LIMIT_MAX", 100),
  authRateLimitMax: getPositiveInt("AUTH_RATE_LIMIT_MAX", 10),
  seedAdminName: getOptionalEnv("SEED_ADMIN_NAME"),
  seedAdminEmail: getOptionalEnv("SEED_ADMIN_EMAIL"),
  seedAdminPassword: getOptionalEnv("SEED_ADMIN_PASSWORD"),
};

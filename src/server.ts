import app from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { AppDataSource } from "./database/data-source";
import { getErrorDetails } from "./utils/error-details";

async function startServer(): Promise<void> {
  try {
    await AppDataSource.initialize();

    logger.info("Conexão com PostgreSQL estabelecida");

    app.listen(env.port, (): void => {
      logger.info(`MedClinic API está executando na porta ${env.port}`);
    });
  } catch (error: unknown) {
    logger.error("Falha ao iniciar a aplicação", getErrorDetails(error));

    logger.on("finish", (): void => {
      process.exit(1);
    });
    logger.end();
  }
}

void startServer();

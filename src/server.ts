import app from "./app";
import { env } from "./config/env";
import { AppDataSource } from "./database/data-source";

async function startServer(): Promise<void> {
  try {
    await AppDataSource.initialize();

    console.log("Conexão com PostgreSQL estabelecida");

    app.listen(env.port, (): void => {
      console.log(`MedClinic API está executando na porta ${env.port}`);
    });
  } catch (error: unknown) {
    console.error("Falha ao iniciar a aplicação:", error);
    process.exit(1);
  }
}

void startServer();

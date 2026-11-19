const DEFAULT_TEST_DB_NAME: string = "medclinic_test";

export const TEST_DB_NAME: string =
  process.env["TEST_DB_NAME"] ?? DEFAULT_TEST_DB_NAME;

export function assertIsTestDatabase(databaseName: string): void {
  if (!databaseName.endsWith("_test")) {
    throw new Error(
      `Testes de integração só podem rodar em bancos terminados em "_test" (recebido: "${databaseName}").`,
    );
  }
}

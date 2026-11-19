import { execSync } from "node:child_process";

import { assertIsTestDatabase, TEST_DB_NAME } from "./test-database";

export default function globalSetup(): void {
  assertIsTestDatabase(TEST_DB_NAME);

  execSync("npm run migration:run", {
    stdio: "pipe",
    env: { ...process.env, DB_NAME: TEST_DB_NAME },
  });
}

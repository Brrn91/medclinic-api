import "dotenv/config";

import { assertIsTestDatabase, TEST_DB_NAME } from "./test-database";

assertIsTestDatabase(TEST_DB_NAME);
process.env["DB_NAME"] = TEST_DB_NAME;

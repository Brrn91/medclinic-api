/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.int.test.ts"],
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.test.json" }],
  },
  globalSetup: "<rootDir>/tests/integration/support/global-setup.ts",
  setupFiles: ["<rootDir>/tests/integration/support/setup-env.ts"],
  clearMocks: true,
  testTimeout: 15000,
  maxWorkers: 1,
};

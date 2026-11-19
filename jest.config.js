/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  testPathIgnorePatterns: ["/node_modules/", "\\.int\\.test\\.ts$"],
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.test.json" }],
  },
  clearMocks: true,
  collectCoverageFrom: ["src/services/**/*.ts"],
  coverageDirectory: "coverage",
};

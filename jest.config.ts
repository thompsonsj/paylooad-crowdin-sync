import type { Config } from "jest";

const config: Config = {
  verbose: true,
  modulePathIgnorePatterns: ["dist"],
  moduleDirectories: [
    "node_modules"
  ],
  transformIgnorePatterns: [
    "node_modules/(?!get-port)"
  ],
  testEnvironment: "node",
  // globalSetup: '<rootDir>/dev/src/tests/globalSetup.ts',
  roots: ["<rootDir>/src/", "<rootDir>/dev/"],
};

export default config;

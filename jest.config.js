module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  coverageDirectory: "coverage",
  collectCoverageFrom: ["src/**/*.ts"],
  coveragePathIgnorePatterns: [
    "node_modules",
    "src/interfaces",
    "src/tests",
    "src/index.ts",
  ],
  testMatch: ["**/*.test.ts"],
  moduleNameMapper: {
    "@/(.*)": "<rootDir>/src/$1",
  },
};

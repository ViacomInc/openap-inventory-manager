/** @type {import('@ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFiles: ["<rootDir>/tests/setup-env.ts"],
  transform: {
    "^.+\\.(gql|graphql)$": "jest-transform-graphql",
    // "\\.(css|less|scss)$": "<rootDir>/tests/styles-mock.js",
  },
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.jest.json",
    },
  },
};

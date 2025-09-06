/** @type {import('jest').Config} */
module.exports = {
  projects: [
    {
      displayName: 'unit',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/test/**/*.spec.ts'],
      transform: { '^.+\\.(t|j)s$': 'ts-jest' },
      moduleFileExtensions: ['ts', 'js', 'json'],
      moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1',
      },
      // coverage, se quiser:
      // collectCoverageFrom: ['<rootDir>/src/**/*.(t|j)s'],
      // coverageDirectory: '<rootDir>/coverage/unit',
    },
    {
      displayName: 'e2e',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/test/**/*.e2e-spec.ts'],
      transform: { '^.+\\.(t|j)s$': 'ts-jest' },
      moduleFileExtensions: ['ts', 'js', 'json'],
      moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1',
      },
      setupFilesAfterEnv: ['<rootDir>/test/setup-e2e.ts'],
      maxWorkers: 1,
      // coverageDirectory: '<rootDir>/coverage/e2e',
    },
  ],
};
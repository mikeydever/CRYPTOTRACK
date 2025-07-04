module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/server/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\.ts$': ['ts-jest', { tsconfig: 'server/tsconfig.json' }],
  },
  transformIgnorePatterns: [
    "node_modules/(?!bcrypt)/"
  ],
};
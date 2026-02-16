module.exports = {
  testEnvironment: 'jsdom',
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.js'
  ],
  collectCoverageFrom: [
    'game.js',
    '!node_modules/**',
    '!dist/**',
    '!coverage/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};

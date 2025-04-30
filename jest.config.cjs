module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx', 'node'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  coverageDirectory: 'coverage',
  testMatch: ['**/tests/**/*.(test|spec).js'],
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
};
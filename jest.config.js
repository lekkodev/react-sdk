/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'jsdom',
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  roots: [
    "src"
  ],
  transformIgnorePatterns: [
		"node_modules/(?!(@buf)/)"
	],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
}
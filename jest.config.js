// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

const babelConfig = require("./babel.config")

let from_dist = false
// @ts-ignore
babelConfig.plugins[ 0 ][ 1 ].alias[ "@" ] = from_dist ? "./dist" : "./src"

module.exports = {
	preset: "ts-jest",
	moduleFileExtensions: [
		"ts",
		"js",
		"json",
		"node"
	],
	"transform": {
		"^.+\\.(t)sx?$": "ts-jest",
	},
	transformIgnorePatterns: [
		"/node_modules/"
	],
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/src/$1"
	},
	testMatch: [
		"**/tests/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx)"
	],
	testURL: "http://localhost/",
	watchPlugins: [
		"jest-watch-typeahead/filename",
		"jest-watch-typeahead/testname"
	],
	globals: {
		"ts-jest": {
			babelConfig,
			diagnostics: false,
		}
	},
	collectCoverageFrom: [
		"**/src/**/*.ts",
		"!**/debug**",
		"!**/node_modules/**",
	],
	coverageDirectory: "coverage",
};

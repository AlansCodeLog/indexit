// https://jestjs.io/docs/en/configuration.html

// maps the path aliases correctly
const tsc = require("typescript")
const tsconfig = tsc.readConfigFile("tsconfig.json", tsc.sys.readFile);
const { pathsToModuleNameMapper } = require('ts-jest/utils')
const moduleNameMapper = pathsToModuleNameMapper(tsconfig.config.compilerOptions.paths, { prefix: '<rootDir>/' })


module.exports = {
	preset: "ts-jest",
	// this will remove jsdom, which has an issue with node 10 (https://github.com/jsdom/jsdom/issues/2961)
	// it also makes tests faster
	testEnvironment: "node",
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
	moduleNameMapper,
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
			babelConfig: true,
			diagnostics: false,
		}
	},
	collectCoverageFrom: [
		"**/src/**/*.ts",
		"!**/node_modules/**",
	],
	coveragePathIgnorePatterns: [
		".*?/helpers/debug.ts",
		".*?/index.ts",
	],
	coverageDirectory: "coverage",
};

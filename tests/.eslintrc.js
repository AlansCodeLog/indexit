module.exports ={
	extends: [
		// ./node_modules/@alanscodelog/eslint-config/.eslintrc.js
		// https://github.com/AlansCodeLog/my-eslint-config
		"@alanscodelog/eslint-config",
		// ./node_modules/@alanscodelog/eslint-config/tests.js
		"@alanscodelog/eslint-config/tests",
	],
	ignorePatterns: [
		"fixtures/**/*"
	],
	rules: {
		// I like to toggle these on occasionally, but otherwise keep them off
		// "import/no-unused-modules": [ "warn", { unusedExports: true, missingExports: false /* interferes with ts */ } ],
		// "@typescript-eslint/no-unnecessary-condition": [ "warn", { checkArrayPredicates: true, ignoreRhs: false /* ??? */ } ],
	}
}

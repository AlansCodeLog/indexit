module.exports ={
	extends: [
		// ./node_modules/@alanscodelog/eslint-config/.eslintrc.js
		// https://github.com/AlansCodeLog/my-eslint-config
		"@alanscodelog/eslint-config"
	],
	rules: {
		// AWAITING https://github.com/benmosher/eslint-plugin-import/issues/903 for @utils alias
		"import/no-extraneous-dependencies": [ "off" ]
		// I like to toggle these on occasionally, but otherwise keep them off
		// "import/no-unused-modules": [ "warn", { unusedExports: true, missingExports: false /* interferes with ts */ } ],
		// "@typescript-eslint/no-unnecessary-condition": [ "warn", { checkArrayPredicates: true, ignoreRhs: false /* ??? */ } ],
	}
}

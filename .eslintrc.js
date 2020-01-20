module.exports = {
	"parser": "@typescript-eslint/parser",
	"parserOptions": {
		"project": "./tsconfig.json",
		"sourceType": "module",
	},
	"root": true,
	"env": {
		"node": true,
		"es6": true,
		"jest":true
	},
	"extends": [
		"eslint:recommended",
		"plugin:import/errors",
		"plugin:import/warnings",
		"plugin:import/typescript"
	],
	"plugins": [
		"import",
		"@typescript-eslint"
	],
	"settings": {
		"import/parsers": {
			"@typescript-eslint/parser": [ ".ts", ".tsx" ]
		},
		"import/resolver": {
			"typescript": {
				"alwaysTryTypes": true
			},
		},
		"import/ignore": ["node_modules"]
	},
	"ignorePatterns":["jest.config.js"],
	"rules": {
		// "import/no-cycle":"warn",
		"quote-props": [ "warn", "as-needed", {
			"unnecessary": true
		}],
		"import/order": [ "warn", {
			"groups": [
				"index",
				"sibling",
				"parent",
				"internal",
				"external",
				"builtin"
			],
			"newlines-between": "always"
		}],
		"import/no-unresolved": "warn",
		"import/no-useless-path-segments": [ "warn", {
			"noUselessIndex": true,
		}],
		"no-restricted-imports": [ "warn", {
			"patterns": ["../*"]
		}],
		"no-console": process.env.NODE_ENV === "production" ? "error" : "off",
		"no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
		"quotes": [ "warn", "double", {
			avoidEscape: false, // use backticks instead
			allowTemplateLiterals: true,
		}],
		"comma-dangle": [ "warn", {
			arrays: "always-multiline",
			objects: "always-multiline",
			imports: "always-multiline",
			exports: "always-multiline",
			functions: "always-multiline",
		}],
		"no-multiple-empty-lines": [ "warn", {
				max: 2, maxEOF: 1, maxBOF: 0
		}],
		"no-tabs": "off",
		"@typescript-eslint/adjacent-overload-signatures": "warn",
		"@typescript-eslint/array-type": "warn",
		"@typescript-eslint/ban-types": "warn",
		// "@typescript-eslint/consistent-type-assertions": "warn",
		// "@typescript-eslint/consistent-type-definitions": "off",
		"@typescript-eslint/explicit-member-accessibility": [ "warn", {
			accessibility: "no-public",
			overrides: {
				parameterProperties: "off",
			},
		}],
		"indent": "off",
		"@typescript-eslint/indent": [ "warn", "tab", {
			SwitchCase: 1,
			ArrayExpression: "first",
			ObjectExpression: "first",
			// i"ve come to realize these are much more readable
			"flatTernaryExpressions": true,
			ignoredNodes: [
				// fixes bug in typescript-eslint
				"TSTypeParameterInstantiation",
				// allows us to indent generics nicely
				"TSTypeParameter",
				// flat ternaries does not really do what i want
				"ConditionalExpression",
				// meesses with nested templates
				"TemplateLiteral > *",
				// allows first line of if to be indented
				"BinaryExpression"
			]
		}],
		"@typescript-eslint/interface-name-prefix": "off",
		"@typescript-eslint/member-delimiter-style": ["warn",{
			multiline: {
				delimiter: "none",
				requireLast: true,
			},
			singleline: {
				delimiter: "semi",
				requireLast: false,
			},
		}],
		"@typescript-eslint/member-ordering": "off",
		"@typescript-eslint/no-empty-function": "warn",
		// so mixin interfaces arent complained about
		"@typescript-eslint/no-empty-interface": [ "warn", {
			"allowSingleExtends": true
		}],
		"@typescript-eslint/no-explicit-any": "off",
		"@typescript-eslint/no-misused-new": "warn",
		"@typescript-eslint/no-namespace": "off",
		"@typescript-eslint/no-parameter-properties": "off",
		"@typescript-eslint/no-unnecessary-type-assertion": "warn",
		"@typescript-eslint/no-use-before-declare": "off",
		"@typescript-eslint/no-var-requires": "warn",
		"@typescript-eslint/prefer-for-of": "warn",
		"@typescript-eslint/prefer-function-type": "warn",
		"@typescript-eslint/prefer-namespace-keyword": "warn",
		// "@typescript-eslint/quotes": [
		// 	"warn",
		// 	"double",
		// 	"backtick"
		// ],
		"@typescript-eslint/semi": [ "warn", "never",],
		"@typescript-eslint/space-within-parens": [ "off", "never"],
		"@typescript-eslint/triple-slash-reference": "warn",
		"@typescript-eslint/type-annotation-spacing": "warn",
		"@typescript-eslint/unified-signatures": "warn",
		"arrow-body-style": "warn",
		"arrow-parens": ["off", "as-needed"],
		"@typescript-eslint/class-name-casing": "warn",
		"camelcase": "off", // todo check for vrsource plugin update to handle my style
		"capitalized-comments": "off",
		"complexity": "off",
		"constructor-super": "warn",
		"curly": [ "warn", "multi-line",],
		"object-curly-spacing": [ "warn", "always", {
				objectsInObjects: true,
				arraysInObjects: false,
		}],
		"array-bracket-spacing": [ "warn", "never", {
				objectsInArrays: false,
				arraysInArrays: false,
		}],
		"dot-notation": "warn",
		"eol-last": "warn",
		"eqeqeq": [ "off", "always" ],
		"guard-for-in": "warn",
		"id-match": "warn",
		// "import/no-deprecated": "warn",
		// "import/order": "warn",
		"no-duplicate-imports": [ "warn", {
			"includeExports": false
		}],
		"max-classes-per-file": "off",
		"max-len": "off",
		"max-lines": [
			"warn",
			1000,
		],
		"new-parens": "warn",
		"no-bitwise": "warn",
		"no-caller": "warn",
		"no-cond-assign": "warn",
		"no-duplicate-case": "warn",
		"no-dupe-class-members": "off", // otherwise there are problems with typescript overloads
		"no-empty": "warn",
		"no-eval": "warn",
		"no-extra-bind": "warn",
		"no-fallthrough": "off",
		"no-invalid-this": "off",
		"no-new-wrappers": "warn",
		"no-sequences": "warn",
		"no-shadow": [ "warn", {
				hoist: "all",
		}],
		"no-template-curly-in-string": "warn",
		"no-throw-literal": "warn",
		"no-trailing-spaces": [ "warn", {
			skipBlankLines: true,
		}],
		"no-undef-init": "warn",
		"no-underscore-dangle": "off",
		"no-unsafe-finally": "warn",
		"no-unused-expressions": [ "warn", {
			allowTernary: true
		}],
		"no-unused-labels": "warn",
		"no-unused-vars": "off",
		"@typescript-eslint/no-unused-vars": [ "warn", {
			vars: "all",
			args: "after-used",
			ignoreRestSiblings: false,
		}],
		"no-var": "warn",
		"object-shorthand": "warn",
		"one-var": [ "off", "never"],
		// "prefer-arrow/prefer-arrow-functions": "warn",
		"prefer-const": "off",
		"@typescript-eslint/prefer-readonly": "warn",
		"radix": "warn",
		"space-before-function-paren": [ "warn", {
				anonymous: "never",
				asyncArrow: "always",
				// "constructor": "never",
				// "method": "never",
				named: "never",
		}],
		"spaced-comment": "warn",
		"use-isnan": "warn",
		"valid-typeof": "off",
		// "@typescript-eslint/tslint/config": [
		// 	"error",
		// 	{
		// 		"rules": {
		// 			"import-blacklist": true,
		// 			"import-spacing": true,
		// 			"jsdoc-format": true,
		// 			"no-inferred-empty-object-type": true,
		// 			"no-reference-import": true,
		// 			"no-tautology-expression": true,
		// 			"one-line": [
		// 				true,
		// 				"check-catch",
		// 				"check-else",
		// 				"check-finally",
		// 				"check-open-brace",
		// 				"check-whitespace"
		// 			],
		// 			"prefer-switch": [
		// 				true,
		// 				{
		// 					"min-cases": 2
		// 				}
		// 			],
		// 			"switch-final-break": true,
		// 			"typedef": [
		// 				true,
		// 				"call-signature",
		// 				"property-declaration",
		// 				"member-variable-declaration"
		// 			],
		// 			"whitespace": [
		// 				true,
		// 				"check-branch",
		// 				"check-decl",
		// 				"check-operator",
		// 				"check-module",
		// 				"check-separator",
		// 				"check-rest-spread",
		// 				"check-type",
		// 				"check-typecast",
		// 				"check-type-operator",
		// 				"check-preblock",
		// 				"check-postbrace"
		// 			]
		// 		}
		// 	}
		// ]
	},
}

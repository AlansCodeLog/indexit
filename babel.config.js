module.exports = {
	"presets": [
		[ "@babel/env",
			{
				"targets": {
					"node": true
				}
			}],
		"@babel/typescript"
	],
	"plugins": [
		[ "module-resolver", {
			"root": [ "../" ],
			"alias": {
				"@": "./src"
			}
		} ],
		"@babel/plugin-proposal-class-properties",
		"@babel/plugin-proposal-nullish-coalescing-operator",
		"@babel/plugin-proposal-optional-chaining",
	],
}

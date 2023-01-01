// yargs is incompatible with vite so vite is not currently being used to build, but the config is needed for vitest, which is working???
// #awaiting https://github.com/yargs/yargs/pull/2261
import { run } from "@alanscodelog/utils/node"
import { babel } from "@rollup/plugin-babel"
import { builtinModules } from "module"
import type { PluginOption } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"

import packageJson from "./package.json"


const typesPlugin = (): PluginOption => ({
	name: "typesPlugin",
	// eslint-disable-next-line no-console
	writeBundle: async () => run("npm run build:types").catch(e => console.log(e)).then(() => undefined),
})

// https://vitejs.dev/config/
export default ({ mode }: { mode: string }) => defineConfig({
	plugins: [
		babel({
			babelHelpers: "runtime",
			extensions: [".js", ".mjs", "ts"],
			presets: [
				["@babel/preset-env", {
					modules: false,
					useBuiltIns: "usage",
					debug: true,
					corejs: packageJson.dependencies["core-js"].slice(1, 4),
				}],
			],
			plugins: ["@babel/plugin-transform-runtime"],
		}),
		// even if we don't use aliases, this is needed to get imports based on baseUrl working
		tsconfigPaths(),
		typesPlugin(),
	],
	build: {
		outDir: "bin",
		lib: {
			entry: "src/index.ts",
			formats: ["es", "cjs"],
		},
		rollupOptions: {
			external: [...builtinModules],
			output: {
				banner: "#!/usr/bin/env node",
			},
		},
		...(mode === "production" ? {
			minify: false,
		} : {
			minify: false,
			sourcemap: "inline",
		}),
	},
	optimizeDeps: {
		include: ["yargs"],
		force: true,
	},
	resolve: {
		alias: [
		],
	},
	server: {
		watch: {
			// watch changes in linked repos
			ignored: ["!**/node_modules/@alanscodelog/**"],
		},
	},
})

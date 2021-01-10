/* eslint-disable @typescript-eslint/no-shadow */

import yargs from "yargs"

import { main } from "@/main"
import { Options, TEST_TYPE } from "@/types"


// careful, don't move, these must be defined before we call indexit and typescript doesn't seem to warn against it and errors at runtime
enum ALIASES {
	IGNORE = "i",
	TAG_START = "ts",
	TAG_END = "te",
	FORCE = "f",
	EXTENSIONS = "x",
	NEWLINES = "n",
	SPACES = "s",
	SECTION_NEWLINES = "N",
	ORDER = "O",
	SORT = "S",
	WILDCARD = "w",
}

const IS_TESTING = process.env?.NODE_ENV === "test"

if (!IS_TESTING) {
	indexit()
		// eslint-disable-next-line no-console
		.catch(error => { console.error(error) })
}

/**
 * Contains all the yargs related stuff for processing the raw cli arguments.
 * When used from the command line it is required by "./index.js" and since IS_TESTING will be false, indexit gets run.
 *
 * Otherwise when we're testing (or if we run this directly with the babel:run script) we can require this indexit function and run it directly to extract it's return (which is only created when testing.)
 */
export async function indexit(args?: string[]): Promise<void | string[][]> {
	// when testing, lets us return to the test what would normally be console.logged
	const testReturn: { value: undefined | string[][] } = { value: undefined }
	// record the promise main returns, because otherwise yargs won't wait for it
	let promise: Promise<void | string[][]> | undefined

	// Note: Doing yargs(args ? args : process.argv) won't work. Not 100% sure why.
	// eslint-disable-next-line @typescript-eslint/no-unused-expressions
	;(args ? yargs(args) : yargs)
		.scriptName("indexit")
		.usage("Usage: $0 <command> [options]")
		.demandCommand(1)
		.command(
			"update [globs...]",
			"create/update indexes",
			addOptions as any,
			yargs => { promise = main({ testing: IS_TESTING, type: TEST_TYPE.UPDATE }, testReturn)(yargs as any) },
		)
		.command(
			"test [globs...]",
			"print out the new contents of the indexes without touching the files",
			addOptions as any,
			yargs => { promise = main({ testing: IS_TESTING, type: TEST_TYPE.TEST }, testReturn)(yargs as any) },
		)
		.help()
		.argv

	yargs.parserConfiguration({
		"short-option-groups": false,
		"camel-case-expansion": false,
		"dot-notation": true,
		"parse-numbers": false,
		"boolean-negation": true,
	})
	if (promise) await promise

	if (testReturn.value) return testReturn.value
}


/** Adds shared options. */
function addOptions(yargs: yargs.Argv<Options>): void {
	yargs
		.positional("globs", {
			default: ["src/**", "src/"],
			description: `A series of globs to determine which folders to search in. Be default it searches src/** AND src/ (this is needed, otherwise we can't detect the "root" index).`,
		})
		.option("ignore", {
			alias: ALIASES.IGNORE,
			type: "array",
			default: [],
			description: `A list of globs to ignore. If a file matches an ignored glob but it's parent folder doesn't, the index.js will still be "managed", but that file won't be exported.`,
		})
		.option("tag.start", {
			alias: ALIASES.TAG_START,
			type: "string",
			default: "/* --Autogenerated Index [OPTIONS]-- */".replace(/--/g, ""), // replace prevents matcher from matching this file
			description: "Determines the start of the managed index. By default it's /* Autogenerated Index [OPTIONS] */. Use [OPTIONS], brackets included, to determine where you specify the way exports will be generated.",
		})
		.option("tag.end", {
			alias: ALIASES.TAG_END,
			type: "string",
			default: "",
			description: "Determines the end of the managed index. If nothing is passed, it's assumed you want the end to be the end of the file.",
		})
		.option("wildcard-exports", {
			alias: ALIASES.WILDCARD,
			type: "boolean",
			default: true,
			description: "If your compiler does not support the `export * as x from \"x\"` syntax, pass --no-wildcard-exports so exports get imported with a wildcard then re-exported as a workaround.",
		})
		.option("force <extension>", {
			alias: ALIASES.FORCE,
			type: "string",
			default: false,
			description: "If files match the given glob but their is no sibling index file if this option is set to something (it should be set to the extension you want the generated indexes to have), the program will pretend there is one with the default options.",
		})
		.option("extensions", {
			alias: ALIASES.EXTENSIONS,
			type: "array",
			default: ["ts", "js"],
			description: "Array of extensions files can be. By default both typescript and javascript files are included: ts, js. The order defines which file to use if there are two files with the same name.",
		})
		.option("newlines", {
			alias: ALIASES.NEWLINES,
			type: "number",
			default: 0,
			description: "How many newlines to put between each named export. Exports that require more than one line to be exported (because e.g. they require to be imported first) never have a line between them.",
		})
		.option("section-newlines", {
			alias: ALIASES.SECTION_NEWLINES,
			type: "number",
			default: 1,
			description: "How many newlines to put between each export section.",
		})
		.option("spaces", {
			alias: ALIASES.SPACES,
			type: "number",
			default: undefined,
			description: "Use this number of spaces instead of tabs for default exports.",
		})
		.option("order", {
			alias: ALIASES.ORDER,
			type: "array",
			default: [
				"named", "default", "types",
			],
			description:
				`Determines the order of the export type "sections" of the index file, by default it's: named, default, types. These supersede the sort option.`,
		})
		.option("sort", {
			alias: ALIASES.SORT,
			type: "array",
			default: [
				"origin-folder-file",
				"anyname-asc",
				// "name-asc",
				// "filename-asc",
			],
			description:
					`A list of "properties" exports can be sorted by (within their export section).

					The default is: \`--sort origin-folder-file anyname-asc\`

					This means exports are sorted first by whether they come from folders or files, then within those two by their names, either the name of the export or the name of the file/folder if it has no export name.

					When sorting by any of the name options, the name is used to sort by, regardless of whether the name is actually used in the export, e.g. \`export * from "..."\`.

					Note that some combinations of these options (because not every entry is definitively before/after another) could potentially cause variances between runs.

					origin-[folder-file/file-folder]
					anyname-[asc/desc]
					name-[asc/desc] - Unlike anyname, exports without a name are sorted last instead of using their filename. Note this is only for exports, folders always have names.
					filename-[asc/desc]`.replace(/\t+/g, ""),
		})
}

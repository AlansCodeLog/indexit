/* eslint-disable no-restricted-imports */ /* There's not much risk of circular deps here. */
import { cleanIndexes, createItem, findPaths, getUpdatedContents, processOptions, writeOrLogDependingOn } from "functions/index.js"
import { pushToParent, removeIndexFilesTo } from "helpers/index.js"
import type { ExtraOptions, Index, Options, RawOptions } from "types.js"


export const main = (extraOptions: ExtraOptions, testReturn: { value: any }) => async (yargs: RawOptions<Options>) => {
	const options = processOptions(yargs, extraOptions)
	if (!options.testing) {
		// eslint-disable-next-line no-console
		console.log("Starting...")
	}

	const paths = await findPaths(options)

	const indexes: Index = {}
	const knownIndexes: string[] = []
	const filtered = paths.filter(removeIndexFilesTo(knownIndexes))

	await Promise.all(filtered
		.map(async itemPath => {
			const item = await createItem(options, knownIndexes, filtered, indexes, itemPath)
			pushToParent(item, indexes)
		}))

	cleanIndexes(options, indexes)

	const contents = getUpdatedContents(indexes, options)

	testReturn.value = await writeOrLogDependingOn(options, contents)
	// because the function returns void[]
	if (!options.testing) testReturn.value = undefined
	if (!options.testing) {
		// eslint-disable-next-line no-console
		console.log("Done!")
	}
}


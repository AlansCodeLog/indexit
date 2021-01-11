import { promises as fs } from "fs"

import { Options, ProcessedItems, TEST_TYPE } from "@/types"

/**
 * Takes care of either logging or actually writing the files, depending on the options.
 * If testing it NEVER ever writes (although only the `test` test type will return anything)
 * Otherwise it depends on the test type.
 */
export async function writeOrLogDependingOn(options: Options, contents: ProcessedItems[]): Promise<void[] | string[][]> {
	const writes: Promise<void>[] = []
	const stdout: string[][] = []
	for (const entry of contents) {
		if (options.type === TEST_TYPE.TEST || options.testing) {
			if (options.testing) {
				stdout.push([entry.path, entry.contents])
			} else {
				// eslint-disable-next-line no-console
				console.log(`Filepath: ${entry.path}`)
				// eslint-disable-next-line no-console
				console.log(entry.contents)
			}
		} else if (!options.testing) {
			writes.push(fs.writeFile(entry.path, entry.contents))
		}
	}
	return options.testing ? stdout : Promise.all(writes)
}

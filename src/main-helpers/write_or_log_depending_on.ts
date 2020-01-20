import fs from "fs-extra"

import { Options , ProcessedItems , TEST_TYPE } from "@/types"

/**
 * Takes care of either logging or actually writing the files, depending on the options.
 * If testing it NEVER ever writes (although only the `test` test type will return anything)
 * Otherwise it depends on the test type.
 */
export async function write_or_log_depending_on(options: Options, contents: ProcessedItems[]): Promise<void[] | string[][]> {
	let writes: Promise<void>[] = []
	let stdout: string[][] = []

	for (let entry of contents) {
		if (options.type == TEST_TYPE.TEST || options.testing) {
			if (options.testing) {
				stdout.push([entry.path, entry.contents])
			} else {
				console.log(`Filepath: ${entry.path}`)
				console.log(entry.contents)
			}
		} else if (!options.testing) {
			writes.push(fs.writeFile(entry.path, entry.contents))
		}
	}
	return options.testing ? stdout : await Promise.all(writes)
}

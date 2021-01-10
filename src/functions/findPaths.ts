import glob from "fast-glob"

import type { Options } from "@/types"

/**
 * Returns all the files matching the glob.
 * Sets ignored to the passed ignore option, and adds the node_modules directory just in case.
 */
export async function findPaths(options: Options): Promise<string[]> {
	const globOpts = {
		ignore: [...options.ignore, "node_modules"],
		absolute: true,
		markDirectories: true, // adds slash at end
		onlyFiles: false, // also includes directories
	}
	const matches = await glob(options.globs, {
		...globOpts,
	})

	return matches
}

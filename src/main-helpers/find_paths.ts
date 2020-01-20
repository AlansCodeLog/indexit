import glob from "fast-glob"

import { Options } from "@/types"

/**
 * Returns all the files matching the glob.
 * Sets ignored to the passed ignore option, and adds the node_modules directory just in case.
 */
export async function find_paths(options: Options): Promise<string[]> {
	let glob_opts = {
		ignore: [...options.ignore, "node_modules"],
		absolute: true,
		markDirectories: true, // adds slash at end
		onlyFiles: false, // also inclused directories
	}
	let matches = await glob(options.globs, {
		...glob_opts,
	})
	return matches
}

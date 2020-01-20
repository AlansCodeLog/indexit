import { ExtraOptions , RawOptions, Options } from "@/types"

/**
 * Extracts the options we use internally from the options processed by yargs (because yargs will keep flag aliases).
 * Additionally there's a few extra options we care about that are not handled by yargs.
 */
export function process_options(yargs: RawOptions<Options>, extra: ExtraOptions): Options {
	return {
		ignore: yargs.ignore,
		globs: yargs.globs,
		tag: yargs.tag,
		force: yargs["force <extension>"] as boolean | string,
		extensions: yargs.extensions,
		type: extra.type,
		testing: extra.testing,
	}
}

import { clean_indexes, create_item, find_paths, get_updated_contents, process_options, write_or_log_depending_on } from "@/functions"
import { push_to_parent, remove_index_files_to } from "@/helpers"
import type { ExtraOptions, Index, Options, RawOptions } from "@/types"


export const main = (extra_options: ExtraOptions, test_return: { value: any }) => async (yargs: RawOptions<Options>) => {
	let options = process_options(yargs, extra_options)
	if (!options.testing) {
		// eslint-disable-next-line no-console
		console.log("Starting...")
	}

	let paths = await find_paths(options)

	let indexes: Index = {}
	let known_indexes: string[] = []
	let filtered = paths.filter(remove_index_files_to(known_indexes))

	await Promise.all(filtered
		.map(async item_path => {
			let item = await create_item(options, known_indexes, indexes, item_path)
			push_to_parent(item, indexes)
		}))

	clean_indexes(options, indexes)

	let contents = get_updated_contents(indexes, options)

	test_return.value = await write_or_log_depending_on(options, contents)
	// because the function returns void[]
	if (!options.testing) test_return.value = undefined
	if (!options.testing) {
		// eslint-disable-next-line no-console
		console.log("Done!")
	}
}


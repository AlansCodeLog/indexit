import { remove_index_files_to, push_to_parent } from "@/helpers"
import { get_updated_contents, write_or_log_depending_on, process_options, find_paths, create_item, clean_indexes } from "@/main-helpers"
import { RawOptions, Options, Index, ExtraOptions } from "@/types"

export const main = (extra_options: ExtraOptions, test_return: { value: any }) => async (yargs: RawOptions<Options>) => {

	let options = process_options(yargs, extra_options)
	if (!options.testing) {
		console.log("Starting...")
	}

	let paths = await find_paths(options)

	let indexes: Index = {}
	let known_indexes: string[] = []

	await Promise.all(paths
		.filter(remove_index_files_to(known_indexes))
		.map(async item_path => {
			let item = await create_item(options, known_indexes, indexes, item_path)
			push_to_parent(item, indexes)
		}))

	clean_indexes(indexes)

	let contents = get_updated_contents(indexes)

	test_return.value = await write_or_log_depending_on(options, contents)
	// because the function returns void[]
	if (!options.testing) test_return.value = undefined
	if (!options.testing) {
		console.log("Done!")
	}
}


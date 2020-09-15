import path from "path"

/** Extracts index files to the given array. */
export const remove_index_files_to = (arr: string[]) => (item_path: string) => {
	let parsed = path.parse(item_path)
	if (parsed.name === "index") {
		arr.push(item_path)
		return false
	}
	return true
}

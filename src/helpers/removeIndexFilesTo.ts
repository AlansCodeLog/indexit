import path from "path"

/** Extracts index files to the given array. */
export const removeIndexFilesTo = (arr: string[]) => (itemPath: string) => {
	const parsed = path.parse(itemPath)
	if (parsed.name === "index") {
		arr.push(itemPath)
		return false
	}
	return true
}

import path from "path"

import { ProcessedItems , EXPORT_TYPE, ITEM_TYPE, EXPORTED_TYPE , Index } from "@/types"

/**
 * For each entry in the index, generates the updated contents and returns them all along with where they should be written.
 */
export function get_updated_contents(indexes: Index): ProcessedItems[]{
	let all_contents = []

	for (let [filepath, entry] of Object.entries(indexes)) {
		let contents = []
		let default_contents = ["export default {"]
		for (let item of entry.items) {

			let item_path = item.type == ITEM_TYPE.FILE
				? item.path
				: path.dirname(item.path)
			let import_path = `./${path.relative(path.dirname(filepath), item_path).replace(/(.*)\..*/, "$1")}`

			if (entry.export_as.includes(EXPORT_TYPE.NAMED)) {

				let already_default = false
				let already_folder = false
				if (item.exported_as.includes(EXPORTED_TYPE.FOLDER_W_NAMED)) {
					already_folder = true
					contents.push(`import * as _${item.name} from "${import_path}"`)
					contents.push(`export const ${item.name} = _${item.name}`)
				}
				if (
					item.exported_as.includes(EXPORTED_TYPE.DEFAULT)
					|| item.exported_as.includes(EXPORTED_TYPE.NAMED_DEFAULT)
				) {
					if (!already_folder) {
						contents.push(`import _${item.name} from "${import_path}"`)
						contents.push(`export const ${item.name} = _${item.name}`)
					}
					already_default = true
				}
				if (item.exported_as.includes(EXPORTED_TYPE.NAMED)) {
					if (already_default && !already_folder) {
						console.warn(`This item, ${item.name} is already exported as default. Also exporting as named would create a conflict`)
					}
					if (!already_folder) {
						if (entry.export_as.includes(EXPORT_TYPE.DEFAULT)) {
							contents.push(`import { ${item.name} } from "${import_path}"`)
						}
						contents.push(`export { ${item.name} } from "${import_path}"`)
					}
				}
				contents.push("")
			}
			if (entry.export_as.includes(EXPORT_TYPE.DEFAULT)) {
				default_contents.push(`\t${item.name},`)
			}
		}
		if (entry.export_as.includes(EXPORT_TYPE.DEFAULT)) {
			default_contents.push("}")
			default_contents.push("")
			contents = [...contents, ...default_contents]
		}

		let start = `${entry.contents.slice(0, entry.start)}\n\n`
		let end = entry.end == entry.contents.length
			? ""
			: `${entry.contents.slice(entry.end, entry.contents.length)}`
		let contents_str = start + contents.join("\n") + end
		all_contents.push({ path: filepath, contents:contents_str })
	}
	return all_contents
}

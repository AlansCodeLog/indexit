import type { Keys } from "@alanscodelog/utils"
// eslint-disable-next-line import/no-extraneous-dependencies
import { keys } from "@utils/retypes"
import path from "path"

import { EXPORT_TYPE, EXPORTED_TYPE, Index, ITEM_TYPE, Options, ProcessedItems } from "@/types"


/**
 * For each entry in the index, generates the updated contents and returns them all along with where they should be written.
 */
export function get_updated_contents(indexes: Index, options: Options): ProcessedItems[] {
	let all_contents = []

	for (let [filepath, entry] of Object.entries(indexes)) {
		let contents: Record<"named" | "default_imports" | "default" | "types", string[]> = {
			named: [],
			default_imports: [],
			default: entry.export_as.includes(EXPORT_TYPE.DEFAULT) ? ["export default {", "\n"] : [],
			types: [],
		}
		const flexible_line = ""

		for (let item of entry.items) {
			if (item.exported_as.includes(EXPORTED_TYPE.IGNORE)) continue

			if (entry.export_as.includes(EXPORT_TYPE.TYPES) && item.exported_as.includes(EXPORTED_TYPE.TYPES)) {
				contents.types.push(`export * from "${item.import_path}"`)
				contents.types.push(flexible_line)
			}
			if (entry.export_as.includes(EXPORT_TYPE.TYPES_NAMESPACED) && item.exported_as.includes(EXPORTED_TYPE.TYPES)) {
				let name = path.parse(item.import_path).name
				contents.types.push(`export * as ${name} from "${item.import_path}"`)
				contents.types.push(flexible_line)
			}

			if (entry.export_as.includes(EXPORT_TYPE.NAMED)) {
				if (item.exported_as.includes(EXPORTED_TYPE.NAMED)) {
					if (item.type === ITEM_TYPE.FILE) {
						contents.named.push(`export { ${item.name} } from "${item.import_path}"`)
					} else {
						if (options.wildcard_exports) {
							contents.named.push(`export * as ${item.name} from "${item.import_path}"`)
						} else {
							contents.named.push(`import * as _${item.name} from "${item.import_path}"`)
							contents.named.push(flexible_line)
							contents.named.push(`export const ${item.name} = _${item.name}`)
						}
					}
					contents.named.push(flexible_line)
				}
				if (item.exported_as.includes(EXPORTED_TYPE.DEFAULT)) {
					contents.named.push(`export { default as ${item.name} } from "${item.import_path}"`)
					contents.named.push(flexible_line)
				}
			}

			if (entry.export_as.includes(EXPORT_TYPE.NAMED_UNWRAPPED)) {
				if (item.exported_as.includes(EXPORTED_TYPE.NAMED)) {
					contents.named.push(`export * from "${item.import_path}"`)
					contents.named.push(flexible_line)
				} else if (item.exported_as.includes(EXPORTED_TYPE.DEFAULT)) {
					contents.named.push(`export { default as ${item.name} } from "${item.import_path}"`)
					contents.named.push(flexible_line)
				}
			}

			if (entry.export_as.includes(EXPORT_TYPE.DEFAULT)) {
				let pushed = false
				if (item.exported_as.includes(EXPORTED_TYPE.NAMED)) {
					pushed = true
					if (item.type === ITEM_TYPE.FILE) {
						contents.default_imports.push(`import { ${item.name} } from "${item.import_path}"`)
					} else {
						contents.default_imports.push(`import * as ${item.name} from "${item.import_path}"`)
					}
					contents.default_imports.push(flexible_line)
				}
				if (item.exported_as.includes(EXPORTED_TYPE.DEFAULT)) {
					pushed = true
					contents.default_imports.push(`import ${item.name} from "${item.import_path}"`)
					contents.default_imports.push(flexible_line)
				}
				if (pushed) {
					contents.default.push(`${options.spaces !== undefined ? " ".repeat(options.spaces) : "\t"}${item.name},`)
					contents.default.push(flexible_line)
				}
			}
		}

		if (entry.export_as.includes(EXPORT_TYPE.DEFAULT)) {
			contents.default.push("}")
		}
		// TODO not sure why keys isn't typing this correctly, it should
		(keys(contents) as Keys<typeof contents>).forEach(_ => {
			if (contents[_][contents[_].length - 1] === flexible_line) contents[_].splice(contents[_].length - 1, 1)
			contents[_] = contents[_].map((line, i) =>
				i !== contents[_].length - 1 && line === flexible_line
					? "\n".repeat(options.newlines + 1)
				: line)
		})


		let contents_ordered: any[] = []

		for (let type of options.order) {
			switch (type) {
				case EXPORT_TYPE.DEFAULT:
					if (contents.default_imports.length > 0) contents_ordered.push(contents.default_imports)
					if (contents.default.length > 0) contents_ordered.push(contents.default)
					break
				case EXPORT_TYPE.NAMED:
				case EXPORT_TYPE.NAMED_UNWRAPPED:
					if (contents.named.length > 0) contents_ordered.push(contents.named)
					break
				case EXPORT_TYPE.TYPES:
				case EXPORT_TYPE.TYPES_NAMESPACED:
					if (contents.types.length > 0) contents_ordered.push(contents.types)
					break
			}
		}


		contents_ordered = contents_ordered.flatMap((entries, i) => i !== contents_ordered.length - 1
		? [...entries, "\n".repeat(options.section_newlines + 1)]
			: entries)


		let start = entry.contents.slice(0, entry.start).trimEnd()
		let end = entry.contents.slice(entry.end, entry.contents.length).trimStart()

		let maybe_newline = contents_ordered.length === 0 ? "" : "\n"
		let contents_str = `${start}\n${maybe_newline}${contents_ordered.join("")}${maybe_newline}${end}`
		all_contents.push({ path: filepath, contents: contents_str })
	}
	return all_contents
}

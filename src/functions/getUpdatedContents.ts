import { type Keys, keys } from "@alanscodelog/utils"
import path from "path"
import { type Index, type Options, type ProcessedItems, EXPORT_TYPE, EXPORTED_TYPE, ITEM_TYPE } from "types.js"

/**
 * For each entry in the index, generates the updated contents and returns them all along with where they should be written.
 */
export function getUpdatedContents(indexes: Index, options: Options): ProcessedItems[] {
	const allContents = []

	for (const [filepath, entry] of Object.entries(indexes)) {
		const contents: Record<"named" | "defaultImports" | "default" | "types", string[]> = {
			named: [],
			defaultImports: [],
			default: entry.exportAs.includes(EXPORT_TYPE.DEFAULT) ? ["export default {", "\n"] : [],
			types: [],
		}
		const flexibleLine = ""

		for (const item of entry.items) {
			if (item.exportedAs.includes(EXPORTED_TYPE.IGNORE)) continue

			if (entry.exportAs.includes(EXPORT_TYPE.TYPES) && item.exportedAs.includes(EXPORTED_TYPE.TYPES)) {
				contents.types.push(`export * from "${item.importPath}"`)
				contents.types.push(flexibleLine)
			}
			if (entry.exportAs.includes(EXPORT_TYPE.TYPES_NAMESPACED) && item.exportedAs.includes(EXPORTED_TYPE.TYPES)) {
				const name = path.parse(item.importPath).name
				contents.types.push(`export * as ${name} from "${item.importPath}"`)
				contents.types.push(flexibleLine)
			}

			if (entry.exportAs.includes(EXPORT_TYPE.NAMED)) {
				if (item.exportedAs.includes(EXPORTED_TYPE.NAMED)) {
					if (item.type === ITEM_TYPE.FILE) {
						contents.named.push(`export { ${item.name} } from "${item.importPath}"`)
					} else {
						if (options.wildcardExports) {
							contents.named.push(`export * as ${item.name} from "${item.importPath}"`)
						} else {
							contents.named.push(`import * as _${item.name} from "${item.importPath}"`)
							contents.named.push(flexibleLine)
							contents.named.push(`export const ${item.name} = _${item.name}`)
						}
					}
					contents.named.push(flexibleLine)
				}
				if (item.exportedAs.includes(EXPORTED_TYPE.DEFAULT)) {
					contents.named.push(`export { default as ${item.name} } from "${item.importPath}"`)
					contents.named.push(flexibleLine)
				}
			}

			if (entry.exportAs.includes(EXPORT_TYPE.NAMED_UNWRAPPED)) {
				if (item.exportedAs.includes(EXPORTED_TYPE.NAMED)) {
					contents.named.push(`export * from "${item.importPath}"`)
					contents.named.push(flexibleLine)
				} else if (item.exportedAs.includes(EXPORTED_TYPE.DEFAULT)) {
					contents.named.push(`export { default as ${item.name} } from "${item.importPath}"`)
					contents.named.push(flexibleLine)
				}
			}

			if (entry.exportAs.includes(EXPORT_TYPE.DEFAULT)) {
				let pushed = false
				if (item.exportedAs.includes(EXPORTED_TYPE.NAMED)) {
					pushed = true
					if (item.type === ITEM_TYPE.FILE) {
						contents.defaultImports.push(`import { ${item.name} } from "${item.importPath}"`)
					} else {
						contents.defaultImports.push(`import * as ${item.name} from "${item.importPath}"`)
					}
					contents.defaultImports.push(flexibleLine)
				}
				if (item.exportedAs.includes(EXPORTED_TYPE.DEFAULT)) {
					pushed = true
					contents.defaultImports.push(`import ${item.name} from "${item.importPath}"`)
					contents.defaultImports.push(flexibleLine)
				}
				if (pushed) {
					contents.default.push(`${options.spaces !== undefined ? " ".repeat(options.spaces) : "\t"}${item.name},`)
					contents.default.push(flexibleLine)
				}
			}
		}

		if (entry.exportAs.includes(EXPORT_TYPE.DEFAULT)) {
			contents.default.push("}")
		}
		(keys(contents) as Keys<typeof contents>).forEach(_ => {
			if (contents[_][contents[_].length - 1] === flexibleLine) contents[_].splice(contents[_].length - 1, 1)
			contents[_] = contents[_].map((line, i) =>
				i !== contents[_].length - 1 && line === flexibleLine
					? "\n".repeat(options.newlines + 1)
				: line)
		})


		let contentsOrdered: any[] = []

		for (const type of options.order) {
			switch (type) {
				case EXPORT_TYPE.DEFAULT:
					if (contents.defaultImports.length > 0) contentsOrdered.push(contents.defaultImports)
					if (contents.default.length > 0) contentsOrdered.push(contents.default)
					break
				case EXPORT_TYPE.NAMED:
				case EXPORT_TYPE.NAMED_UNWRAPPED:
					if (contents.named.length > 0) contentsOrdered.push(contents.named)
					break
				case EXPORT_TYPE.TYPES:
				case EXPORT_TYPE.TYPES_NAMESPACED:
					if (contents.types.length > 0) contentsOrdered.push(contents.types)
					break
			}
		}


		contentsOrdered = contentsOrdered.flatMap((entries, i) => i !== contentsOrdered.length - 1
		? [...entries, "\n".repeat(options.sectionNewlines + 1)]
			: entries)


		const start = entry.contents.slice(0, entry.start).trimEnd()
		const end = entry.contents.slice(entry.end, entry.contents.length).trimStart()

		const maybeNewline = contentsOrdered.length === 0 ? "" : "\n"
		const contentsStr = `${start}\n${maybeNewline}${contentsOrdered.join("")}${maybeNewline}${end}`
		allContents.push({ path: filepath, contents: contentsStr })
	}
	return allContents
}

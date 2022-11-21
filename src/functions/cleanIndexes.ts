import { pretty } from "@utils/utils"

import { EXPORT_TYPE, EXPORTED_TYPE, Index, Item, ITEM_TYPE, Options, SORT_MAIN, SORT_ORDER_NAME, SortEntry } from "@/types"


/** Removes empty indexes and sorts each entry's items so they'll be exported in alphabetical order by their name. */
export function cleanIndexes(options: Options, indexes: Index): void {
	for (const [filepath, entry] of Object.entries(indexes)) {
		const duplicates: Item[] = []

		entry.items.forEach((item, i) => {
			if (item.name.match(/^[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*$/) === null) {
				if (!item.exportedAs.includes(EXPORTED_TYPE.IGNORE)) {
					throw new Error(`The folder "${item.name}" at ${item.path} is an invalid variable name. Folders that are not ignored or empty must be named as a valid javascript variable. Details:\n${pretty(item)}`)
				}
			}

			const duplicate = entry.items.findIndex(_item => _item.name === item.name)
			if (duplicate !== i) duplicates.push(item)
		})
		if (duplicates.length > 0) {
			throw new Error(`Found conflicting/duplicate export names:\n\t${duplicates.map(item => `"${item.name}" at ${item.originalPath}`).join("\n\t")}`)
		}

		if (entry.exportAs.length === 0 || entry.start === undefined) {
			if (entry.start === undefined && options.force) {
				entry.contents = "/* Autogenerated Index */\n"
				entry.exportAs = [EXPORT_TYPE.NAMED]
				entry.start = entry.contents.length
				entry.end = entry.contents.length

				delete indexes[filepath]
				indexes[`${filepath}index${options.force}`] = entry
			} else {
				delete indexes[filepath]; continue
			}
		}
		entry.items = entry.items.sort((a, b) => {
			let i = 0
			let check = compare(a, b, options.sort[i])
			while (check === 0 && i < options.sort.length) {
				check = compare(a, b, options.sort[i])
				i++
			}
			return check
		})
	}
}

function compare(a: Item, b: Item, sort: SortEntry): 0 | -1 | 1 | number {
	switch (sort.type) {
		case SORT_MAIN.ORIGIN: {
			if (a.type === b.type) return 0
			if (sort.order[0] === ITEM_TYPE.FILE) {
				return a.type === ITEM_TYPE.FILE ? -1 : 1
			} else {
				return a.type === ITEM_TYPE.FOLDER ? -1 : 1
			}
		}
		case SORT_MAIN.ANYNAME: {
			if (a.name === b.name) return 0
			if (sort.order === SORT_ORDER_NAME.ASC) {
				return a.name.localeCompare(b.name)
			} else {
				return b.name.localeCompare(a.name)
			}
		}
		case SORT_MAIN.NAME: {
			if (a.exportName === b.exportName) return 0
			if (sort.order === SORT_ORDER_NAME.ASC) {
				if (a.exportName === undefined) return 1
				if (b.exportName === undefined) return -1
				return a.exportName.localeCompare(b.exportName)
			} else {
				if (a.exportName === undefined) return -1
				if (b.exportName === undefined) return 1
				return b.exportName.localeCompare(a.exportName)
			}
		}
		case SORT_MAIN.FILENAME: {
			if (a.importPath === b.importPath) return 0
			if (sort.order === SORT_ORDER_NAME.ASC) {
				return a.importPath.localeCompare(b.importPath)
			} else {
				return b.importPath.localeCompare(a.importPath)
			}
		}
	}
}

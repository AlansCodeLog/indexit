import { EXPORTED_TYPE, Index, Item, ITEM_TYPE, Options, SORT_MAIN, SORT_ORDER_NAME, SortEntry } from "@/types"


/** Removes empty indexes and sorts each entry's items so they'll be exported in alphabetical order by their name. */
export function clean_indexes(options: Options, indexes: Index): void {
	for (let [filepath, entry] of Object.entries(indexes)) {
		let duplicates: Item[] = []

		entry.items.forEach((item, i) => {
			if (item.name.match(/^[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*$/) === null) {
				if (!item.exported_as.includes(EXPORTED_TYPE.IGNORE)) {
					throw new Error(`The folder "${item.name}" at ${item.path} is an invalid variable name. Folders that are not ignored or empty must be named as a valid javascript variable.`)
				}
			}

			let duplicate = entry.items.findIndex(_item => _item.name === item.name)
			if (duplicate !== i) duplicates.push(item)
		})
		if (duplicates.length > 0) {
			throw new Error(`Found conflicting/duplicate export names:\n\t${duplicates.map(item => `"${item.name}" at ${item.original_path}`).join("\n\t")}`)
		}

		if (entry.export_as.length === 0 || entry.start === undefined) { delete indexes[filepath]; continue }
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
			if (a.export_name === b.export_name) return 0
			if (sort.order === SORT_ORDER_NAME.ASC) {
				if (a.export_name === undefined) return 1
				if (b.export_name === undefined) return -1
				return a.export_name.localeCompare(b.export_name)
			} else {
				if (a.export_name === undefined) return -1
				if (b.export_name === undefined) return 1
				return b.export_name.localeCompare(a.export_name)
			}
		}
		case SORT_MAIN.FILENAME: {
			if (a.import_path === b.import_path) return 0
			if (sort.order === SORT_ORDER_NAME.ASC) {
				return a.import_path.localeCompare(b.import_path)
			} else {
				return b.import_path.localeCompare(a.import_path)
			}
		}
	}
}
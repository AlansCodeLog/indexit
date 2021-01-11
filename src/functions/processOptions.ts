import { EXPORT_TYPE, ExtraOptions, ITEM_TYPE, Options, RawOptions, SORT_MAIN, SORT_ORDER_NAME } from "@/types"


/**
 * Extracts the options we use internally from the options processed by yargs (because yargs will keep flag aliases).
 * Additionally there's a few extra options we care about that are not handled by yargs.
 */
export function processOptions(yargs: RawOptions<Options>, extra: ExtraOptions): Options {
	const sort: Options["sort"] = yargs.sort.map(rawEntry => {
		switch (rawEntry) {
			case "origin-folder-file":
				return { type: SORT_MAIN.ORIGIN, order: [ITEM_TYPE.FOLDER, ITEM_TYPE.FILE]}
			case "origin-file-folder":
				return { type: SORT_MAIN.ORIGIN, order: [ITEM_TYPE.FILE, ITEM_TYPE.FOLDER]}
			case "anyname-asc":
				return { type: SORT_MAIN.ANYNAME, order: SORT_ORDER_NAME.ASC }
			case "anyname-desc":
				return { type: SORT_MAIN.ANYNAME, order: SORT_ORDER_NAME.DESC }
			case "name-asc":
				return { type: SORT_MAIN.NAME, order: SORT_ORDER_NAME.ASC }
			case "name-desc":
				return { type: SORT_MAIN.NAME, order: SORT_ORDER_NAME.DESC }
			case "filename-asc":
				return { type: SORT_MAIN.FILENAME, order: SORT_ORDER_NAME.ASC }
			case "filename-desc":
				return { type: SORT_MAIN.FILENAME, order: SORT_ORDER_NAME.DESC }
		}
	})


	const order: Options["order"] = yargs.order.map(rawEntry => {
		switch (rawEntry) {
			case "types": return EXPORT_TYPE.TYPES
			case "named": return EXPORT_TYPE.NAMED
			case "default": return EXPORT_TYPE.DEFAULT
		}
	})

	if (order.length !== 3) {
		throw new Error("Order option must include all options in some order.")
	}

	if (yargs.newlines < 0) throw new Error("newlines option cannot be less than 0.")
	if (yargs.spaces !== undefined && yargs.spaces < 0) throw new Error("spaces option cannot be less than 0.")
	if (yargs["section-newlines"] < 0) throw new Error("section-newlines option cannot be less than 0.")

	if (yargs.force === true) {
		throw new Error("force option must specify extension to use (`--force .js` or `--force js`) for the index file.")
	}
	if (typeof yargs.force === "string" && !yargs.force.startsWith(".")) {
		yargs.force = `.${yargs.force}`
	}

	return {
		ignore: yargs.ignore,
		globs: yargs.globs,
		tag: yargs.tag,
		wildcardExports: yargs["wildcard-exports"],
		force: yargs.force as string,
		extensions: yargs.extensions,
		sort,
		order,
		newlines: yargs.newlines,
		spaces: isNaN(yargs.spaces) ? undefined : yargs.spaces,
		sectionNewlines: yargs["section-newlines"],
		type: extra.type,
		testing: extra.testing,
	}
}

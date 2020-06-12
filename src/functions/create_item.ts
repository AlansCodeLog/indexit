import { promises as fs } from "fs"
import path from "path"

import { is_folder } from "@/helpers"
import { DeepPartialObj, EXPORT_TYPE, EXPORTED_TYPE, Index, Item, ITEM_TYPE, OnlyRequire, Options } from "@/types"
import { escape_regex, push_if_not_exist } from "@/utils"

/**
 * Creates an [[Index]] entry/item or nothing if none should be created.
 * There are some cases where one is return but isn't needed, but those are taken care of by "./clean_indexes.ts"
 */
export async function create_item(options: Options, known_indexes: string[], indexes: Partial<Index>, item_path: string): Promise<Item | undefined> {
	let item: DeepPartialObj<Item> & OnlyRequire<Item, "exported_as" | "path"> = {
		path: item_path,
		original_path: item_path,
		parent: undefined,
		name: undefined,
		export_name: undefined,
		exported_as: [] as any,
		type: undefined,
	}

	if (is_folder(item_path)) {
		let existing = known_indexes.find(index_path => index_path.includes(item_path))
		if (existing !== undefined) {
			item.type = ITEM_TYPE.FOLDER
			item.path = existing
			item.name = path.parse(path.dirname(item.path)).base
			let parent_path = path.dirname(path.dirname(item.path))
			item.parent = `${parent_path}/`
			item.name = /.*\/(.*?)\/index/.exec(item.path)![1]
			item.export_name = item.name
		} else {
			return
		}
	} else {
		item.type = ITEM_TYPE.FILE
		item.parent = `${path.parse(item.path).dir}/`
	}

	let item_dir_path = item.type === ITEM_TYPE.FILE
		? item.path
		: path.dirname(item.path)

	item.import_path = `./${path.parse(item_dir_path).name}`

	let full_parent = known_indexes.find(known_path => known_path.includes(`${item.parent!}index`))
	if (full_parent !== undefined) { item.parent = full_parent }
	let contents = (await fs.readFile(item.path)).toString()
	// detects manual named exports
	// https://regexr.com/4s9ol
	contents.replace(/^export (?:async )?(type|interface|class|const|function|let|default (?:function|class)(?!\s*?\()|default (?!(?:function\s*?\(|class\s*?\{)))(?!\n)\s*?((?!\{)\S+?)($|<|\(|\s)/m, (match: string, group_type: string, group_name: string) => {
		let type = group_type.trim()
		if (item.type !== ITEM_TYPE.FOLDER) {
			item.name = group_name.trim()
			item.export_name = item.name
		}
		if (type.includes("default")) {
			push_if_not_exist(item.exported_as, EXPORTED_TYPE.DEFAULT)
		} else {
			push_if_not_exist(item.exported_as, type === "type" || type === "interface"
				? EXPORTED_TYPE.TYPES
				: EXPORTED_TYPE.NAMED)
		}
		return match
	})

	// detects manual default and re-exported named exports
	let as_default = contents.match(/(^export default {|^export default function .*?\(|^export default class .*?\{)/gm)
	if (as_default !== null) push_if_not_exist(item.exported_as, EXPORTED_TYPE.DEFAULT)
	let as_named = contents.match(/^export {[\s\S]*?}/g)
	if (as_named !== null) {
		push_if_not_exist(item.exported_as, EXPORTED_TYPE.NAMED)
	}

	// if we still haven't found a name, set it to the file name
	if (item.name === undefined) {
		let parsed = path.parse(item.path)
		let file_name = parsed.name
		item.name = file_name
	}

	if (item.type === ITEM_TYPE.FOLDER) {
		let dir = item.path
		if (!indexes[dir]) {
			indexes[dir] = { items: [], export_as: [], contents } as any
		}

		let entry = indexes[dir]!
		entry.contents = contents
		// find header
		let rg_start = escape_regex(options.tag.start)
			.replace(/\\\[OPTIONS\\\]\s*/, "(?:\\[(.*?)\\])?\\s*?")
		let rg_end = escape_regex(options.tag.end)
		let rg = `${rg_start}[\\s\\S]*?${rg_end}`
		let header_opts_regex = new RegExp(rg, "gm")

		// parse options
		let matched = false as boolean
		let no_options = false // user forcefully passed [] which means the exported_as type is set by auto-detection and the index file is not generated
		contents.replace(header_opts_regex, (match: string, group_opts: string) => {
			if (group_opts !== undefined) {
				let opts = group_opts.split(",")
					.map(option => option.trim().toUpperCase())
					.filter(option => option !== "")
				if (opts.length === 0) no_options = true
				for (let opt of opts) {
					switch (opt) {
						case EXPORT_TYPE.NAMED: push_if_not_exist(entry.export_as, EXPORT_TYPE.NAMED); break
						case EXPORT_TYPE.NAMED_UNWRAPPED: push_if_not_exist(entry.export_as, EXPORT_TYPE.NAMED_UNWRAPPED); break
						case EXPORT_TYPE.DEFAULT: push_if_not_exist(entry.export_as, EXPORT_TYPE.DEFAULT); break
						case EXPORT_TYPE.IGNORE: push_if_not_exist(entry.export_as, EXPORT_TYPE.IGNORE); break
						case EXPORT_TYPE.TYPES: push_if_not_exist(entry.export_as, EXPORT_TYPE.TYPES); break
						case EXPORT_TYPE.TYPES_NAMESPACED: push_if_not_exist(entry.export_as, EXPORT_TYPE.TYPES_NAMESPACED); break
						default: throw new Error(`Unknown Option ${opt}. Allowed options are: Named, Named-Unwrapped, Default, Types, Types-Namespaced, and Ignore (case does not matter).`)
					}
				}
			}
			matched = true
			return match
		})
		if (matched) {
			// If the user didn't pass any options, create named exports by default
			if (entry.export_as.filter(type => type !== EXPORT_TYPE.IGNORE).length === 0) {
				if (!no_options) {
					entry.export_as.push(EXPORT_TYPE.NAMED)
				} else {
					entry.export_as.push(EXPORT_TYPE.IGNORE)
				}
			}

			// set how the folder is exported if it's re-exported
			if (entry.export_as.includes(EXPORT_TYPE.DEFAULT)) {
				item.exported_as = [EXPORTED_TYPE.DEFAULT]
			}
			if (entry.export_as.includes(EXPORT_TYPE.NAMED) || entry.export_as.includes(EXPORT_TYPE.NAMED_UNWRAPPED)) {
				item.exported_as = [EXPORTED_TYPE.NAMED]
			}
			if (entry.export_as.includes(EXPORT_TYPE.IGNORE)) {
				item.exported_as.push(EXPORTED_TYPE.IGNORE)
			}
			if (entry.export_as.includes(EXPORT_TYPE.TYPES) || entry.export_as.includes(EXPORT_TYPE.TYPES_NAMESPACED)) {
				item.exported_as.push(EXPORTED_TYPE.TYPES)
			}
		}

		// find and record the writable sections of the entry
		let start_i_match = contents.match(new RegExp(rg_start))
		let end_i_match = contents.match(new RegExp(rg_end))
		entry.end = rg_end.length > 0 && end_i_match
			? (end_i_match.index ?? contents.length)
				: contents.length

		entry.start = start_i_match
			? start_i_match.index! + start_i_match[0].length
			: entry.end
	}

	return item as Item
}

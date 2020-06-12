import path from "path"

import fs from "fs-extra"


import { is_folder } from "@/helpers"
import { Options, Index, Item, EXPORTED_TYPE, EXPORT_TYPE, ITEM_TYPE, DeepPartialObj, OnlyRequire } from "@/types"
import { escape_regex, push_if_not_exist } from "@/utils"

/**
 * Creates an [[Index]] entry/item or nothing if none should be created.
 * There are some cases where one is return but isn't needed, but those are taken care of by "./clean_indexes.ts"
 */
export async function create_item(options: Options, known_indexes: string[], indexes: Index, item_path: string): Promise<Item | undefined> {
	let item: DeepPartialObj<Item> & OnlyRequire<Item, "exported_as" | "path"> = {
		path: item_path,
		original_path: item_path,
		parent: undefined,
		name: undefined,
		exported_as: [] as any,
		type: undefined,
	}
	if (is_folder(item_path)) {
		let existing = known_indexes.find(index_path => index_path.includes(item_path))
		if (existing) {
			item.type = ITEM_TYPE.FOLDER
			item.path = existing
			item.name = path.parse(path.dirname(item.path)).base
			let parent_path = path.dirname(path.dirname(item.path))
			item.parent = parent_path + "/"
			item.path.replace(/.*\/(.*?)\/index/, (match, g) => item.name = g)
		}
		else {
			return
		}
	}
	else {
		item.type = ITEM_TYPE.FILE
		item.parent = path.parse(item.path).dir + "/"
	}
	let full_parent = known_indexes.find(known_path => known_path.includes(item.parent + "index"))
	if (full_parent)
	{item.parent = full_parent}
	let contents = (await fs.readFile(item.path)).toString()
	// https://regexr.com/4s9ol
	contents.replace(/^export (?:async )?(class|const|function|let|default (?:function|class)(?!\s*?\()|default (?!(?:function\s*?\(|class\s*?\{)))(?!\n)\s*?((?!\{)\S+?)($|<|\(|\s)/gm, (match: string, group_type: string, group_name: string) => {
		item.name = group_name

		if (group_type.includes("default")) {
			push_if_not_exist(item.exported_as, EXPORTED_TYPE.NAMED_DEFAULT)
		}
		else {
			push_if_not_exist(item.exported_as, item.type == ITEM_TYPE.FOLDER
				? EXPORTED_TYPE.FOLDER_W_NAMED
				: EXPORTED_TYPE.NAMED)
		}
		return match
	})
	let as_default = contents.match(/(^export default {|^export default function .*?\(|^export default class .*?\{)/gm)
	if (as_default) push_if_not_exist(item.exported_as, EXPORTED_TYPE.DEFAULT)
	let as_named
	if (item.type == ITEM_TYPE.FOLDER) {
		as_named = contents.match(/^export {[\s\S]*?}/g)
		if (as_named) {
			push_if_not_exist(item.exported_as, EXPORTED_TYPE.FOLDER_W_NAMED)
		}
	}
	if (!item.name) {
		let parsed = path.parse(item.path)
		let file_name = parsed.name
		item.name = file_name
	}
	if (item.type == ITEM_TYPE.FOLDER) {
		let dir = item.path
		if (!indexes[dir])
		{indexes[dir] = { items: [], export_as: [], contents } as any}
		let entry = indexes[dir]
		entry.contents = contents
		let rg_start = escape_regex(options.tag.start)
			.replace(/\\\[OPTIONS\\\]\s*/, "(?:\\[(.*?)\\])?\\s*?")
		let rg_end = escape_regex(options.tag.end)
		let rg = rg_start + "[\\s\\S]*?" + rg_end
		let header_opts_regex = new RegExp(rg, "gm")
		let matched = false
		contents.replace(header_opts_regex, (match: string, group_opts: string) => {
			if (group_opts) {
				let opts = group_opts.split(",").map(option => option.trim().toUpperCase())
				for (let opt of opts) {
					switch (opt) {
						case EXPORT_TYPE.NAMED: {
							push_if_not_exist(entry.export_as, EXPORT_TYPE.NAMED)
						} break
						case EXPORT_TYPE.DEFAULT: {
							push_if_not_exist(entry.export_as, EXPORT_TYPE.DEFAULT)
						} break
						case EXPORT_TYPE.IGNORE: {
							push_if_not_exist(entry.export_as, EXPORT_TYPE.IGNORE)
						} break
						default: {
							throw new Error(`Unknown Option ${opt}. Allowed options are: Named, Default, and Ignore (case does not matter).`)
						}
					}
				}
			}

			matched = true
			return match
		})

		if (entry.export_as.filter(type => type !== EXPORT_TYPE.IGNORE).length == 0) {
			entry.export_as.push(EXPORT_TYPE.NAMED)
		}

		if (entry.export_as.includes(EXPORT_TYPE.DEFAULT)) {
			item.exported_as = [EXPORTED_TYPE.DEFAULT]
		}
		if (entry.export_as.includes(EXPORT_TYPE.NAMED)) {
			item.exported_as = [EXPORTED_TYPE.FOLDER_W_NAMED]
		}
		if (entry.export_as.includes(EXPORT_TYPE.IGNORE)) {
			item.exported_as.push(EXPORTED_TYPE.IGNORE)
		}


		if (matched) {
			let start_i_match = contents.match(new RegExp(rg_start))
			let end_i_match = contents.match(new RegExp(rg_end))
			let end_i = rg_end.length > 0
				? typeof end_i_match == "object" && end_i_match
					? end_i_match.index || contents.length
					: contents.length
				: contents.length
			let start_i = start_i_match!.index! + start_i_match![0].length
			entry.start = start_i
			entry.end = end_i
		}
	}

	return item as Item
}

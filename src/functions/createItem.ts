import { promises as fs } from "fs"
import path from "path"

import { isFolder } from "@/helpers"
import { DeepPartialObj, EXPORT_TYPE, EXPORTED_TYPE, Index, Item, ITEM_TYPE, OnlyRequire, Options } from "@/types"
import { escapeRegex, pushIfNotExist } from "@/utils"


/** Returns the path of an known index if it exists. Prioritizes finding an existing path inside known indexes according to the options path (in particular `extension` and `force`). */
function findExisting(itemPath: string, known: string[], options: Options, useForce: boolean = true): string | undefined {
	// todo - could be optimized a bit more
	const existingStart = `${itemPath}${useForce && options.force ? options.force : ""}`
	if (useForce && options.force) {
		return known.find(indexPath => indexPath.startsWith(existingStart))
	} else {
		const maybeExisting = known.filter(indexPath => indexPath.startsWith(existingStart))

		if (options.extensions.length > 0) {
			return maybeExisting.sort((a, b) => {
				const aExt = a.match(/.*\.(.*)/)![1]
				const bExt = b.match(/.*\.(.*)/)![1]
				return options.extensions.indexOf(aExt) - options.extensions.indexOf(bExt)
			})[0]
		} else {
			return maybeExisting[0]
		}
	}
}
/**
 * Creates an [[Index]] entry/item or nothing if none should be created.
 * There are some cases where one is return but isn't needed, but those are taken care of by "./cleanIndexes.ts"
 */
export async function createItem(options: Options, knownIndexes: string[], filtered: string[], indexes: Partial<Index>, itemPath: string): Promise<Item | undefined> {
	const item: DeepPartialObj<Item> & OnlyRequire<Item, "exportedAs" | "path"> = {
		path: itemPath,
		originalPath: itemPath,
		parent: undefined,
		name: undefined,
		exportName: undefined,
		exportedAs: [] as any,
		type: undefined,
	}

	if (isFolder(itemPath)) {
		const existing = findExisting(`${itemPath}index`, knownIndexes, options)

		if (existing !== undefined) {
			item.type = ITEM_TYPE.FOLDER
			item.path = existing
			item.name = path.parse(path.dirname(item.path)).base
			const parentPath = path.dirname(path.dirname(item.path))
			item.parent = `${parentPath}/`
			item.name = /.*\/(.*?)\/index/.exec(item.path)![1]
			item.exportName = item.name
		} else {
			return
		}
	} else {
		item.type = ITEM_TYPE.FILE
		item.parent = `${path.parse(item.path).dir}/`
	}

	const itemDirPath = item.type === ITEM_TYPE.FILE
		? item.path
		: path.dirname(item.path)

	item.importPath = `./${path.parse(itemDirPath).name}`

	const existsWithDifferentExt = findExisting(item.path.match(/(.*)\..*/)![1], filtered, options, false)

	// ignore file with same name but different (more prioritized extension)
	if (existsWithDifferentExt !== undefined
		&& item.path !== existsWithDifferentExt) return


	const fullParent = findExisting(`${item.parent}index`, knownIndexes, options)
	if (fullParent !== undefined) { item.parent = fullParent }
	const contents = (await fs.readFile(item.path)).toString()
	// detects manual named exports
	// https://regexr.com/4s9ol
	contents.replace(/^export (?:async )?(type|interface|class|const|function|let|default (?:function|class)(?!\s*?\()|default (?!(?:function\s*?\(|class\s*?\{)))(?!\n)\s*?((?!\{)\S+?)($|:|<|\(|\s)/m, (match: string, groupType: string, groupName: string) => {
		const type = groupType.trim()
		if (item.type !== ITEM_TYPE.FOLDER) {
			item.name = groupName.trim()
			item.exportName = item.name
		}
		if (type.includes("default")) {
			pushIfNotExist(item.exportedAs, EXPORTED_TYPE.DEFAULT)
		} else {
			pushIfNotExist(item.exportedAs, type === "type" || type === "interface"
				? EXPORTED_TYPE.TYPES
				: EXPORTED_TYPE.NAMED)
		}
		return match
	})

	// detects manual default and re-exported named exports
	const asDefault = contents.match(/(^export default {|^export default function .*?\(|^export default class .*?\{)/gm)
	if (asDefault !== null) pushIfNotExist(item.exportedAs, EXPORTED_TYPE.DEFAULT)
	const asNamed = contents.match(/^export {[\s\S]*?}/g)
	if (asNamed !== null) {
		pushIfNotExist(item.exportedAs, EXPORTED_TYPE.NAMED)
	}

	// if we still haven't found a name, set it to the file name
	if (item.name === undefined) {
		const parsed = path.parse(item.path)
		const fileName = parsed.name
		item.name = fileName
	}

	if (item.type === ITEM_TYPE.FOLDER) {
		const dir = item.path
		if (!indexes[dir]) {
			indexes[dir] = { items: [], exportAs: [], contents } as any
		}

		const entry = indexes[dir]!
		entry.contents = contents
		// find header
		const rgStart = escapeRegex(options.tag.start)
			.replace(/\\\[OPTIONS\\\]\s*/, "(?:\\[(.*?)\\])?\\s*?")
		const rgEnd = escapeRegex(options.tag.end)
		const rg = `${rgStart}[\\s\\S]*?${rgEnd}`
		const headerOptsRegex = new RegExp(rg, "gm")

		// parse options
		let matched = false as boolean
		let noOptions = false // user forcefully passed [] which means the exportedAs type is set by auto-detection and the index file is not generated
		contents.replace(headerOptsRegex, (match: string, groupOpts: string) => {
			if (groupOpts !== undefined) {
				const opts = groupOpts.split(",")
					.map(option => option.trim().toUpperCase())
					.filter(option => option !== "")
				if (opts.length === 0) noOptions = true
				for (const opt of opts) {
					switch (opt) {
						case EXPORT_TYPE.NAMED: pushIfNotExist(entry.exportAs, EXPORT_TYPE.NAMED); break
						case EXPORT_TYPE.NAMED_UNWRAPPED: pushIfNotExist(entry.exportAs, EXPORT_TYPE.NAMED_UNWRAPPED); break
						case EXPORT_TYPE.DEFAULT: pushIfNotExist(entry.exportAs, EXPORT_TYPE.DEFAULT); break
						case EXPORT_TYPE.IGNORE: pushIfNotExist(entry.exportAs, EXPORT_TYPE.IGNORE); break
						case EXPORT_TYPE.TYPES: pushIfNotExist(entry.exportAs, EXPORT_TYPE.TYPES); break
						case EXPORT_TYPE.TYPES_NAMESPACED: pushIfNotExist(entry.exportAs, EXPORT_TYPE.TYPES_NAMESPACED); break
						default: throw new Error(`Unknown Option ${opt} as ${dir}. Allowed options are: Named, Named-Unwrapped, Default, Types, Types-Namespaced, and Ignore (case does not matter).`)
					}
				}
			}
			matched = true
			return match
		})
		if (matched) {
			// If the user didn't pass any options, create named exports by default
			if (entry.exportAs.filter(type => type !== EXPORT_TYPE.IGNORE).length === 0) {
				if (!noOptions) {
					entry.exportAs.push(EXPORT_TYPE.NAMED)
				} else {
					entry.exportAs.push(EXPORT_TYPE.IGNORE)
				}
			}

			// set how the folder is exported if it's re-exported
			if (entry.exportAs.includes(EXPORT_TYPE.DEFAULT)) {
				item.exportedAs = [EXPORTED_TYPE.DEFAULT]
			}
			if (entry.exportAs.includes(EXPORT_TYPE.NAMED) || entry.exportAs.includes(EXPORT_TYPE.NAMED_UNWRAPPED)) {
				item.exportedAs = [EXPORTED_TYPE.NAMED]
			}
			if (entry.exportAs.includes(EXPORT_TYPE.IGNORE)) {
				item.exportedAs.push(EXPORTED_TYPE.IGNORE)
			}
			if (entry.exportAs.includes(EXPORT_TYPE.TYPES) || entry.exportAs.includes(EXPORT_TYPE.TYPES_NAMESPACED)) {
				item.exportedAs.push(EXPORTED_TYPE.TYPES)
			}
		}

		// find and record the writable sections of the entry
		const iStartMatch = contents.match(new RegExp(rgStart))
		const iEndMatch = contents.match(new RegExp(rgEnd))
		entry.end = rgEnd.length > 0 && iEndMatch
			? (iEndMatch.index ?? contents.length)
				: contents.length

		entry.start = iStartMatch
			? iStartMatch.index! + iStartMatch[0].length
			: entry.end
	}

	return item as Item
}

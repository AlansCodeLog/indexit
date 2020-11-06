export type Options = {
	ignore: string[]
	globs: string[]
	tag: {
		start: string
		end: string
	}
	wildcard_exports: boolean
	force: boolean | string
	extensions: string[]
	sort: SortEntry[]
	order: SORT_ORDER_EXPORT[]
	newlines: number
	section_newlines: number
	spaces: number | undefined
	// glob_opts: glob.Options
} & ExtraOptions

export type ExtraOptions = {
	testing: boolean
	type: TEST_TYPE
}

export type RawOptions<T> = Omit<T, "sort" | "order" | "section_newlines" | "wildcard_exports"> & {
	_: string
	$0: string
	[key: string]: unknown
	sort: (
		| "origin-folder-file"
		| "origin-file-folder"
		| "anyname-asc"
		| "anyname-desc"
		| "name-asc"
		| "name-desc"
		| "filename-asc"
		| "filename-desc"
	)[]
	order: ("named" | "default" | "types")[]
	"wildcard-exports": boolean
	"section-newlines": number
	spaces: typeof NaN
}

export type SortEntry =
	| {
		type: SORT_MAIN.NAME | SORT_MAIN.FILENAME | SORT_MAIN.ANYNAME
		order: SORT_ORDER_NAME
	}
	| {
		type: SORT_MAIN.ORIGIN
		order: ITEM_TYPE[]
	}

export enum SORT_MAIN {
	ORIGIN = "ORIGIN",
	NAME = "NAME",
	ANYNAME = "ANYNAME",
	FILENAME = "FILENAME",
}

export enum SORT_ORDER_NAME {
	ASC = "ASC",
	DESC = "DESC"
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export type SORT_ORDER_EXPORT = Exclude<EXPORT_TYPE, EXPORT_TYPE.IGNORE>

export type Index = {
	[key: string]: {
		export_as: EXPORT_TYPE[]
		items: Item[]
		start: number
		end: number
		contents: string
	}
}

export type Item = {
	parent: string
	path: string
	original_path: string
	import_path: string
	name: string
	export_name: string | undefined
	type: ITEM_TYPE
	exported_as: EXPORTED_TYPE[]
}

export type ProcessedItems = {
	path: string
	contents: string
}

export enum TEST_TYPE {
	TEST = "TEST",
	UPDATE = "UPDATE",
}

export enum EXPORTED_TYPE {
	NAMED = "NAMED",
	DEFAULT = "DEFAULT",
	IGNORE = "IGNORE",
	TYPES = "TYPES",
}

// note dashes are used in the string version since we use the values to match against the options directly
export enum EXPORT_TYPE {
	NAMED = "NAMED",
	NAMED_UNWRAPPED = "NAMED-UNWRAPPED",
	DEFAULT = "DEFAULT",
	IGNORE = "IGNORE",
	TYPES = "TYPES",
	TYPES_NAMESPACED = "TYPES-NAMESPACED",
}

export enum ITEM_TYPE {
	FILE = "FILE",
	FOLDER = "FOLDER",
}

// UTILITY TYPES
export type DeepPartialArr<T> = {
	[P in keyof T]?: DeepPartialArr<T>[]
}

export type DeepPartialObj<T> = {
	[P in keyof T]?: DeepPartialObj<T[P]> | T[P];
}

export type OnlyRequire<T, TKey extends keyof T> = Pick<T, TKey> & Partial<Omit<T, TKey>>

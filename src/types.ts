// import glob from "fast-glob"

export type Options = {
	ignore: string[]
	globs: string[]
	tag: {
		start: string
		end: string
	}
	force: boolean | string
	extensions: string[]
	// glob_opts: glob.Options
} & ExtraOptions

export type ExtraOptions = {
	testing: boolean
	type: TEST_TYPE
}

export type RawOptions<T> = T & {
	_: string
	$0: string
	[key: string]: unknown
}

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
	name: string
	type: ITEM_TYPE
	exported_as: EXPORTED_TYPE[]
}

export type ProcessedItems = { path: string; contents: string }

export enum TEST_TYPE {
	TEST = "TEST",
	UPDATE = "UPDATE",
}

export enum EXPORTED_TYPE {
	NAMED = "NAMED",
	DEFAULT = "DEFAULT",
	NAMED_DEFAULT = "NAMED_DEFAULT",
	FOLDER_W_NAMED = "FOLDER_W_NAMED",
	IGNORE = "IGNORE",
}

export enum EXPORT_TYPE {
	NAMED = "NAMED",
	DEFAULT = "DEFAULT",
	IGNORE = "IGNORE",
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

export type OnlyRequire<T, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>>

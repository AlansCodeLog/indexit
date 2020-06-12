import type { Index, Options } from "@/types"

/** Removes empty indexes and sorts each entry's items so they'll be exported in alphabetical order by their name. */
export function clean_indexes(_options: Options, indexes: Index): void {
	for (let [filepath, entry] of Object.entries(indexes)) {
		if (entry.export_as.length === 0 || entry.start === undefined) { delete indexes[filepath]; continue }
		entry.items = entry.items.sort((a, b) => a.name.localeCompare(b.name))
	}
}

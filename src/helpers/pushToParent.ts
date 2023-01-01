import type { Index, Item } from "types.js"

/** Takes care of adding an item to it's parent, and creating the parent if it didn't already exist. */
export function pushToParent(item: Item | undefined, indexes: Partial<Index>): void {
	if (!item) return
	indexes[item.parent] ??= { items: [], exportAs: []} as any

	const parent = indexes[item.parent]!
	const exists = parent.items.findIndex(existing => existing.path === item.path) !== -1
	if (!exists) {
		parent.items.push(item)
	}
}

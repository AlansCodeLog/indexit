import type { Index, Item } from "@/types"

/** Takes care of adding an item to it's parent, and creating the parent if it didn't already exist. */
export function push_to_parent(item: Item | undefined, indexes: Partial<Index>): void {
	if (!item) return
	if (!indexes[item.parent]) indexes[item.parent] = { items: [], export_as: []} as any
	let parent = indexes[item.parent]!
	parent.items.push(item)
}

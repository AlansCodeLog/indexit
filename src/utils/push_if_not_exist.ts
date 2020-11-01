/** Pushes item into array if it doesn't already include it. */
export function push_if_not_exist<T>(arr: T[], item: T): void {
	if (!arr.includes(item)) {
		arr.push(item)
	}
}

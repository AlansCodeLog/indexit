/** Escapes unknown text to be used to create a regex. */
export function escapeRegex(str: string): string {
	return str.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")
}

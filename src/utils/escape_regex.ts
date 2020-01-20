/** Escapes unknown text to be used to create a regex. */
export function escape_regex(str: string) {
	return str.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")
}

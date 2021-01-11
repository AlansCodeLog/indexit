/** Returns if a path is a folder, given folders end in a "/" */
export function isFolder(path: string): boolean {
	return path.endsWith("/")
}

/** Returns if a path is a folder, given folders end in a "/" */
export function is_folder(path: string) {
	return path[path.length - 1] == "/"
}

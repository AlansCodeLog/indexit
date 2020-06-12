import util from "util"

/** Console logs large nested objects in full. */
export function debug(obj: any): void {
	// eslint-disable-next-line no-console
	console.log(util.inspect(obj, false, null, true))
}

import util from "util"

/** Console logs large nested objects in full. */
export function debug(obj: any) {
	console.log(util.inspect(obj, false, null, true))
}

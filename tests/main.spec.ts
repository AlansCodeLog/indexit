import fs from "fs-extra"
import { expect } from "chai"

import { indexit } from "@/indexit"


it("test command (and therefore update) works (in theory)", async () => {
	let stdout = await indexit("test tests/fixtures/**/* tests/fixtures/ -i **/*expected.ts".split(" ")) as [string, string][]

	stdout.forEach(([filepath, contents]: [string, string]) => {
		let expected_filepath = filepath.replace("index", "index.expected")
		let exists = fs.statSync(expected_filepath)
		expect(!!exists).to.equal(true)
		if (exists) {
			let expected_contents = fs.readFileSync(expected_filepath).toString()
			expect(contents).to.equal(expected_contents)
		}
	})
})

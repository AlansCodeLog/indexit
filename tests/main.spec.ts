import { test_name } from "@utils/testing"
import { expect } from "chai"
// eslint-disable-next-line no-restricted-imports
import fs from "fs"

import { indexit } from "@/indexit"


describe(test_name(), () => {
	it("test command (and therefore update) works (in theory)", async () => {
		let stdout = await indexit("test tests/fixtures/**/* tests/fixtures/ -i **/*expected.ts".split(" ")) as [string, string][]

		stdout.forEach(([filepath, contents]: [string, string]) => {
			let expected_filepath = filepath.replace("index.ts", "index.expected.ts")
			let exists = fs.statSync(expected_filepath)
			expect(!!exists).to.equal(true)
			if (exists) {
				let expected_contents = fs.readFileSync(expected_filepath).toString()
				expect(contents).to.equal(expected_contents)
			}
		})
	})
})

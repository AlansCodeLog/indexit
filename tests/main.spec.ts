import { test_name } from "@utils/testing"
import { expect } from "chai"
import { sync as globSync } from "fast-glob"
// eslint-disable-next-line no-restricted-imports
import fsSync, { promises as fs } from "fs"
import path from "path"

import { indexit } from "@/indexit"


// eslint-disable-next-line @typescript-eslint/no-misused-promises
describe("test command (and therefore update) works (in theory)", () => {
	let commands = globSync(`${process.cwd()}/tests/fixtures/**/*.txt`)
	for (let command_file of commands) {
		let dir = path.dirname(command_file)
		let name = path.parse(dir).name
		let command = fsSync.readFileSync(command_file).toString().split("\n")[0]
			.replace(/\[DIR\]/g, name)

		it(`${name} (${command})`, async done => {
			let stdout = await indexit(command.split(" ")) as [string, string][]
			await Promise.all(stdout.map(async ([filepath, contents]: [string, string]) => {
				let expected_filepath = filepath.replace("index.ts", "index.expected.ts")
				let exists = await fs.stat(expected_filepath).then(() => true).catch(() => false)

				expect(!!exists).to.equal(true)
				if (exists) {
					let expected_contents = (await fs.readFile(expected_filepath)).toString()

					// filepath is here for debugging purposes, it won't match if the contents don't match so we can quickly find it when debugging
					expect({ filepath, contents }).to.deep.equal({ filepath: contents === expected_contents ? filepath : "Ignore, this will not error if the contents match.", contents: expected_contents })
				}
			}))
			done()
		})
	}
})

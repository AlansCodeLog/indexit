import { test_name } from "@utils/testing"
import { expect } from "chai"
import glob from "fast-glob"
// eslint-disable-next-line no-restricted-imports
import fsSync, { promises as fs } from "fs"
import path from "path"

import { indexit } from "@/index"


describe("test command (and therefore update) works (in theory)", () => {
	it("works", async () => {
		let commands = await glob(`tests/fixtures/**/command.txt`, { absolute: true })
		expect(commands.length).to.be.greaterThan(0)
		return Promise.all(commands.map(async command_file => {
			let dir = path.dirname(command_file)
			let name = path.parse(dir).name
			let command = fsSync.readFileSync(command_file).toString().split("\n")[0]
				.replace(/\[DIR\]/g, name)

			let stdout = await indexit(command.split(" ")) as [string, string][]
			await Promise.all(stdout.map(async ([filepath, contents]: [string, string]) => {
				let expected_filepath = filepath.replace(/index\.(.*?)/, "index.expected.$1")
				let exists = await fs.stat(expected_filepath).then(() => true).catch(() => false)
				let not_expected_exists = await fs.stat(expected_filepath).then(() => true).catch(() => false)

				expect(!!exists).to.equal(true, `${filepath
					} found but missing: ${expected_filepath}`)

				if (exists) {
					let expected_contents = (await fs.readFile(expected_filepath)).toString()

					// filepath is here for debugging purposes, it won't match if the contents don't match so we can quickly find it when debugging
					expect({ filepath, expected_filepath, contents }).to.deep.equal({
						filepath: contents === expected_contents ? filepath : "Ignore, this properties will not error if the contents match.",
						expected_filepath: contents === expected_contents ? expected_filepath : "Ignore, this properties will not error if the contents match.",
						contents: expected_contents,
					})
				}
			}))
		}))
	})
})

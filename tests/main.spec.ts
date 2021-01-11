import { testName } from "@utils/testing"
import { expect } from "chai"
import glob from "fast-glob"
// eslint-disable-next-line no-restricted-imports
import fsSync, { promises as fs } from "fs"
import path from "path"

import { indexit } from "@/index"


describe("test command (and therefore update) works (in theory)", () => {
	it("works", async () => {
		const commands = await glob(`tests/fixtures/**/command.txt`, { absolute: true })
		expect(commands.length).to.be.greaterThan(0)
		return Promise.all(commands.map(async commandFile => {
			const dir = path.dirname(commandFile)
			const name = path.parse(dir).name
			const command = fsSync.readFileSync(commandFile).toString().split("\n")[0]
				.replace(/\[DIR\]/g, name)

			const stdout = await indexit(command.split(" ")) as [string, string][]
			await Promise.all(stdout.map(async ([filepath, contents]: [string, string]) => {
				const expectedFilepath = filepath.replace(/index\.(.*?)/, "index.expected.$1")
				const exists = await fs.stat(expectedFilepath).then(() => true).catch(() => false)
				const notExpectedExists = await fs.stat(expectedFilepath).then(() => true).catch(() => false)

				expect(!!exists).to.equal(true, `${filepath
					} found but missing: ${expectedFilepath}`)

				if (exists) {
					const expectedContents = (await fs.readFile(expectedFilepath)).toString()

					// filepath is here for debugging purposes, it won't match if the contents don't match so we can quickly find it when debugging
					expect({ filepath, expectedFilepath, contents }).to.deep.equal({
						filepath: contents === expectedContents ? filepath : "Ignore, this properties will not error if the contents match.",
						expectedFilepath: contents === expectedContents ? expectedFilepath : "Ignore, this properties will not error if the contents match.",
						contents: expectedContents,
					})
				}
			}))
		}))
	})
})

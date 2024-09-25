import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import { transformFields, parseCsv } from "../src/csv/parser.ts";
import { deepEquals } from "bun";
import { createTestFolder, removeTestFolder, testPath } from "./utils.ts";
import { writeFile } from "node:fs/promises";

test("transformFields convers number compatible strings to numbers in an object", () => {
	expect(
		deepEquals(
			transformFields({
				id: "1",
				name: "Alberto",
				age: "27",
				from: "🇦🇱",
			}),
			{
				id: 1,
				name: "Alberto",
				age: 27,
				from: "🇦🇱",
			},
		),
	).toBe(true);
});

describe("parseCsv", () => {
	beforeAll(async () => {
		await createTestFolder();
		await writeFile(
			testPath("test.csv"),
			`
      id,name,age,email
      1,Alberto,25,alberto@gmail.com
      2,Maria,30,maria@gmail.com
      `.trim(),
		);
	});

	test("should return an array of objects", async () => {
		const { rows } = await parseCsv(testPath("test.csv"));

		expect(rows).toBeInstanceOf(Array);
		expect(rows.length).toBe(2);

		expect(
			deepEquals(rows[0], {
				id: 1,
				name: "Alberto",
				age: 25,
				email: "alberto@gmail.com",
			}),
		).toBe(true);

		expect(
			deepEquals(rows[1], {
				id: 2,
				name: "Maria",
				age: 30,
				email: "maria@gmail.com",
			}),
		).toBe(true);
	});

	test("should return expected headers", async () => {
		const { headers } = await parseCsv(testPath("test.csv"));
		expect(headers).toBeInstanceOf(Array);
		expect(headers.length).toBe(4);
		expect(headers).toEqual(["id", "name", "age", "email"]);
	});

	afterAll(async () => {
		await removeTestFolder();
	});
});

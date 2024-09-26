import { expect, test, describe } from "bun:test";
import { parseQuery } from "../src/query";

describe("parseQuery", () => {
	test("should parse a single field", () => {
		const result = parseQuery("PROJECT name");

		if ("errorMessage" in result) {
			expect().fail();
		} else {
			expect(result.fields).toEqual(["name"]);
		}
	});
	test("should parse a query with multiple fields", () => {
		const result = parseQuery("PROJECT name, age");

		if ("errorMessage" in result) {
			expect().fail();
		} else {
			expect(result.fields).toEqual(["name", "age"]);
		}
	});
	test("should parse a query with a Wildcard", () => {
		const result = parseQuery("PROJECT *");
		if ("errorMessage" in result) {
			expect().fail();
		} else {
			expect(result.fields).toEqual([]);
		}
	});
	test("should parse a query with a condition on numeric value", () => {
		const sample = [
			{ name: "Alberto", age: 25 },
			{ name: "Maria", age: 30 },
		];
		const result = parseQuery("PROJECT * FILTER age > 26");
		if ("errorMessage" in result) {
			expect().fail();
		} else {
			const filtered = sample.filter((r) => result.filter(r));
			expect(filtered).toEqual([{ name: "Maria", age: 30 }]);
		}
	});
	test("should parse a query with condition on string value", () => {
		const sample = [
			{ name: "Alberto", age: 25 },
			{ name: "Maria", age: 30 },
		];

		const result = parseQuery("PROJECT age FILTER name = `Alberto`");

		if ("errorMessage" in result) {
			expect().fail();
		} else {
			const filtered = sample.filter((r) => result.filter(r));
			expect(filtered).toEqual([{ name: "Alberto", age: 25 }]);
		}
	});
});

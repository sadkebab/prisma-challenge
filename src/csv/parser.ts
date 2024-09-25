import { parse as fastCsvParse } from "@fast-csv/parse";
import { createReadStream } from "node:fs";
import type { Prettify } from "../lib/types";

type CsvRow = Record<string, string | number | undefined>;

type CsvParserOptionsDefault = {
	delimiter: string;
};

const defaultCsvParserOptions: CsvParserOptionsDefault = {
	delimiter: ",",
};

type CsvParserOptions = Prettify<Partial<CsvParserOptionsDefault>>;

type ParseResult = Prettify<{
	headers: string[];
	rows: CsvRow[];
}>;

export function parseCsv(
	csvPath: string,
	options?: CsvParserOptions,
): Promise<ParseResult> {
	return new Promise((resolve, reject) => {
		const { delimiter } = {
			...defaultCsvParserOptions,
			...options,
		};
		const rows: CsvRow[] = [];
		const fields: string[] = [];

		// we assume that the file has a header
		const csvParserStream = fastCsvParse({
			headers: true,
			delimiter,
		})
			.on("error", (error) => reject(error))
			.on("headers", (headers) => fields.push(...headers))
			.on("data", (row) => rows.push(transformFields(row)))
			.on("end", () => resolve({ rows, headers: fields }));

		createReadStream(csvPath).pipe(csvParserStream);
	});
}

export function transformFields(row: CsvRow): CsvRow {
	for (const key in row) {
		// Number("") is evaluated as 0, which is not what we want
		if (row[key] === "") {
			continue;
		}

		// using Number instead of parseFloat because the latter will return a number
		// for any string that starts with a digit or .digit after being trimmed
		const num = Number(row[key]);

		if (!Number.isNaN(num)) {
			// we assign to object directly to avoid allocating new memory
			row[key] = num;
		}
	}

	return row;
}

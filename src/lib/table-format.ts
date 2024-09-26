import chalk from "chalk";
import Table from "cli-table3";

export function format(rows: Record<string, unknown>[], headers: string[]) {
	const table = new Table({
		head: headers,
		style: {
			head: ["blue"],
		},
		chars: {
			top: " ",
			"top-mid": " ",
			"top-left": " ",
			"top-right": " ",
			bottom: " ",
			"bottom-mid": " ",
			"bottom-left": " ",
			"bottom-right": " ",
			left: " ",
			"left-mid": "",
			right: " ",
			"right-mid": "",
			mid: "",
			middle: "|",
			"mid-mid": "",
		},
	});

	for (const row of rows) {
		table.push(headers.map((header) => `${row[header]}`));
	}

	const color = rows.length > 0 ? chalk.green : chalk.red;
	table.push([
		{
			content: color(`${rows.length} rows found`),
			colSpan: headers.length,
		},
	]);

	return table.toString();
}

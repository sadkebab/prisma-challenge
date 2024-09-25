import yargs from "yargs";
import { run } from "./lib/runner.ts";
import { hideBin } from "yargs/helpers";

const cli = yargs(hideBin(process.argv))
	.version("0.0.1")
	.usage("Usage: $0 start <csvPath> [options]")
	.option("delimiter", {
		alias: "d",
		string: true,
		default: ",",
	})
	.help("help")
	.check((args) => {
		const paths = args._;
		if (paths.length === 0) {
			throw new Error("File path is required");
		}

		if (paths.length > 1) {
			throw new Error("Only one file path is allowed");
		}

		if (typeof paths[0] === "string" && paths[0].endsWith(".csv")) {
			throw new Error("File path must not end with .csv");
		}

		if (args.delimiter.length !== 1) {
			throw new Error("Delimiter must be a single character");
		}
		return true;
	});

run(
	async () => {
		const { delimiter, _: paths } = await cli.parse();
		// we are sure it's a string because of yarg check
		const csvPath = paths[0] as string;

		console.log(csvPath, delimiter);
	},
	{
		onError: (err) => {
			console.error(err.message);
			process.exit(1);
		},
	},
);

import { args } from "./lib/args.ts";
import { run } from "./lib/runner.ts";

run(async () => {
  const { csvPath } = args();
  console.log(csvPath);
}, {
  onError: (err) => {
    console.error(err.message);
    process.exit(1);
  },
});
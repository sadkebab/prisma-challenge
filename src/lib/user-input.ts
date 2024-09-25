import readline from "node:readline";

export async function userInput(prompt: string): Promise<string> {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	// readline will intercept SIGINT so we need to emit it ourselves
	// as a workaround for https://github.com/nodejs/node/issues/4758
	rl.on("SIGINT", () => {
		process.emit("SIGINT");
	});

	return new Promise((resolve) => {
		rl.question(prompt, (answer) => {
			rl.close();
			resolve(answer);
		});
	});
}

import { mkdir, rm, exists } from "node:fs/promises";

const testFolder = ".test";

export async function createTestFolder() {
	if (await exists(`./${testFolder}`)) {
		await rm(`./${testFolder}`, { recursive: true, force: true });
	}
	await mkdir(`./${testFolder}`, { recursive: true });
}

export async function cleanup() {
	await rm(`./${testFolder}`, { recursive: true, force: true });
}

export function testPath(path: string) {
	return `./${testFolder}/${path}`;
}

/**
 * All this script does is make it easy to paste all the shit into my NEA.
 * When run, it writes all the code to a results.md file.
 * Using something like vscode, the markdown can be previewed.
 * Make sure to be using a light theme and then copy and paste every line,
 * every single fucking one of them and paste them into the document and pray
 * the computer doesn't explode.
 */

const fs = require("fs/promises");

const RESULTS_FILE = "results.md";
const DIRS = ["components", "lib", "pages", "tests", "../nea-server/src"];
const IGNORE = [".DS_Store"];

async function readDirectory(path) {
	const dir = await fs.opendir(path);
	for await (const dirent of dir) {
		if (IGNORE.includes(dirent.name)) continue;

		const pathname = `${path}/${dirent.name}`;
		console.log(pathname + "\n");

		if (dirent.isDirectory()) {
			await readDirectory(pathname);
		} else {
			const contents = await fs.readFile(pathname);
			const a = `
# **${pathname}**

\`\`\`ts
${contents.toLocaleString()}
\`\`\`
			`;
			await fs.appendFile(RESULTS_FILE, a);
		}
	}
}

async function main() {
	// clear the file
	await fs.writeFile(RESULTS_FILE, "");

	await Promise.all(DIRS.map((path) => readDirectory(path)));
}

main();

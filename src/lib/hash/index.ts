"VERNAM CIPHER";

/**
 * It takes a number and returns a character made by transposing the code for
 * the letter "a" by the number
 * @param {number} i - The integer to convert to a character.
 * @returns A function that takes a number and returns a string.
 */
export function intToChar(i: number) {
	const code = "a".charCodeAt(0);
	return String.fromCharCode(code + i);
}

/**
 * It takes a string, splits it into an array of characters, maps each character to a new character
 * based on its index in the array, and then joins the array back into a string
 * @param {string} input - The string to be encrypted
 * @returns A string
 */
export function generateKey(input: string): string {
	return input
		.split("")
		.map((c, i) =>
			intToChar(c.charCodeAt(0) + (Math.round(Math.random() * i) + i))
		)
		.join("");
}

/**
 * Simple Vernam cipher: takes a string and a key, and returns the encrypted string
 * @param {string} input - the string to encrypt
 * @param {string} key - "abcdefghijklmnopqrstuvwxyz"
 * @returns The encrypted string
 */
export function encrypt(input: string, key: string): string {
	return input
		.split("")
		.map((c, i) => c.charCodeAt(0) ^ key[i].charCodeAt(0))
		.map((x) => String.fromCharCode(x))
		.join("");
}

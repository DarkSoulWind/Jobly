/**
 * It generates a public key and a private key
 * @param {number} p - a prime number
 * @param {number} q - a prime number
 * @returns The public key and private key
 */
export function generateKeys(
	p: number,
	q: number
): { publicKey: number[]; privateKey: number[] } {
	const n = p * q;
	const phi = (p - 1) * (q - 1);
	let e = 2;
	while (e < phi) {
		if (gcd(e, phi) === 1) {
			break;
		}
		e++;
	}
	const d = modularInverse(e, phi);
	return { publicKey: [e, n], privateKey: [d, n] };
}

/**
 * It takes a string and a public key, and returns an array of numbers
 * @param {string} plaintext - The string to encrypt.
 * @param {number[]} publicKey - [e, n]
 * @returns The encrypted message
 */
export function encrypt(plaintext: string, publicKey: number[]): number[] {
	const encrypted = [];
	for (const char of plaintext) {
		encrypted.push(modPow(char.charCodeAt(0), publicKey[0], publicKey[1]));
	}
	return encrypted;
}

/**
 * It decrypts the encrypted message by raising each encrypted character to the power of the private
 * key's first element, modulo the private key's second element
 * @param {number[]} encrypted - The encrypted message.
 * @param {number[]} privateKey - [d, n]
 * @returns The encrypted message.
 */
export function decrypt(encrypted: number[], privateKey: number[]): string {
	let plaintext = "";
	for (const code of encrypted) {
		plaintext += String.fromCharCode(
			modPow(code, privateKey[0], privateKey[1])
		);
	}
	return plaintext;
}

/**
 * If b is 0, return a, otherwise return the GCD of b and the remainder of a divided by b.
 * @param {number} a - number - The first number to use in the calculation.
 * @param {number} b - the number of times the loop will run
 * @returns The greatest common divisor of a and b.
 */
function gcd(a: number, b: number): number {
	if (b === 0) {
		return a;
	}
	return gcd(b, a % b);
}

/**
 * It finds the modular inverse of a number, which is the number that when multiplied by the original
 * number, gives you 1
 * @param {number} a - the number to find the inverse of
 * @param {number} m - the modulus
 * @returns The modular inverse of a mod m.
 */
function modularInverse(a: number, m: number): number {
	let m0 = m;
	let y = 0;
	let x = 1;

	if (m === 1) {
		return 0;
	}

	while (a > 1) {
		const q = Math.floor(a / m);
		let t = m;

		m = a % m;
		a = t;
		t = y;

		y = x - q * y;
		x = t;
	}

	if (x < 0) {
		x += m0;
	}

	return x;
}

/**
 * If the exponent is even, square the base and halve the exponent. If the exponent is odd, multiply
 * the result by the base and subtract one from the exponent.
 * @param {number} base - the number we're raising to a power
 * @param {number} exponent - 65537
 * @param {number} modulus - the modulus
 * @returns The modulus of the base to the power of the exponent.
 */
function modPow(base: number, exponent: number, modulus: number): number {
	if (modulus === 1) {
		return 0;
	}
	let result = 1;
	base = base % modulus;
	while (exponent > 0) {
		if (exponent % 2 === 1) {
			result = (result * base) % modulus;
		}
		exponent = exponent >> 1;
		base = (base * base) % modulus;
	}
	return result;
}

/**
 * If n is less than 2, return false. Otherwise, loop through all numbers from 2 to the square root of
 * n, and if any of them divide n evenly, return false. Otherwise, return true.
 * @param {number} n - number - The number to check if it's prime.
 * @returns A function that takes a number and returns a boolean.
 */
export function isPrime(n: number): boolean {
	if (n < 2) return false;
	for (let i = 2; i <= Math.sqrt(n); i++) {
		if (n % i === 0) return false;
	}
	return true;
}

/**
 * It generates a random number, checks if it's prime, and if it's not, it generates another random
 * number and checks if it's prime, and so on, until it finds a prime number
 * @param {number} bitLength - The bit length of the number to be generated.
 * @returns A random prime number
 */
export function generateRandomPrime(bitLength: number): number {
	let randomNumber: number;
	do {
		randomNumber = Math.floor(Math.random() * 2 ** bitLength);
	} while (!isPrime(randomNumber));
	return randomNumber;
}

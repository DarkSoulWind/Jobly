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

// TODO: Generate keys when client logs in
// 1. When client logs in, generate keys
// 2. 
export function generateKeys(p: number, q: number): {publicKey: number[], privateKey: number[]} {
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
  return {publicKey: [e, n], privateKey: [d, n]};
}

export function encrypt(plaintext: string, publicKey: number[]): number[] {
  const encrypted = [];
  for (const char of plaintext) {
    encrypted.push(modPow(char.charCodeAt(0), publicKey[0], publicKey[1]));
  }
  return encrypted;
}

export function decrypt(encrypted: number[], privateKey: number[]): string {
  console.log("file: RSA.ts~line: 54~decrypt~encrypted", encrypted);
  let plaintext = "";
  for (const code of encrypted) {
    plaintext += String.fromCharCode(
      modPow(code, privateKey[0], privateKey[1])
    );
  }
  return plaintext;
}

export function gcd(a: number, b: number): number {
  if (b === 0) {
    return a;
  }
  return gcd(b, a % b);
}

export function modularInverse(a: number, m: number): number {
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

export function modPow(base: number, exponent: number, modulus: number): number {
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

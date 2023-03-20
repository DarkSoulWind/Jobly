/**
 * If n is less than 2, return false. Otherwise, loop through all numbers from 2 to the square root of
 * n, and if any of them divide n evenly, return false. Otherwise, return true.
 * @param {number} num - number - The number to check if it's prime.
 * @returns A function that takes a number and returns a boolean.
 */
export function isPrime(num: number): boolean {
  if (num < 2) return false;

  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
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
  let randomNumber = Math.floor(Math.random() * 2 ** bitLength);
  while (!isPrime(randomNumber)) {
    randomNumber = Math.floor(Math.random() * 2 ** bitLength);
  }
  return randomNumber;
}

// TODO: Generate keys when client logs in
export function generateKeys(
  prime1: number,
  prime2: number
): { publicKey: [number, number]; privateKey: [number, number] } {
  const modulus = prime1 * prime2;
  const phiValue = (prime1 - 1) * (prime2 - 1);

  let iteration = 2;
  while (iteration < phiValue) {
    if (gcd(iteration, phiValue) === 1) {
      break;
    }
    iteration++;
  }

  const modInv = modularInverse(iteration, phiValue);

  return {
    publicKey: [iteration, modulus],
    privateKey: [modInv, modulus],
  };
}

/**
 * It takes a string and a public key, and returns an array of numbers
 * @param {string} plaintext - The string to encrypt.
 * @param {number[]} publicKey - [e, n]
 * @returns The encrypted message
 */
export function encrypt(plaintext: string, publicKey: number[]): number[] {
  const a = plaintext.split("").reduce((encrypted, char) => {
    return [
      ...encrypted,
      modPow(char.charCodeAt(0), publicKey[0], publicKey[1]),
    ];
  }, [] as Array<number>);
  const encrypted = [];
  for (const char of plaintext) {
    encrypted.push(modPow(char.charCodeAt(0), publicKey[0], publicKey[1]));
  }

  if (a === encrypted) {
    console.log("THEY MATCH BRO")
  }
  return encrypted;
}

/**
 * It takes an array of numbers and an array of two numbers, and returns a string
 * @param {number[]} encrypted - the encrypted message
 * @param {number[]} privateKey - [d, n]
 * @returns The plaintext is being returned.
 */
export function decrypt(encrypted: number[], privateKey: number[]): string {
  const plaintext = encrypted.reduce((currentPlaintext, code) => {
    return [
      currentPlaintext,
      String.fromCharCode(modPow(code, privateKey[0], privateKey[1])),
    ].join("");
  }, "");
  return plaintext;
}

/**
 * If b is 0, return a, otherwise return the GCD of b and the remainder of a divided by b.
 * @param {number} num1 - The first number to find the greatest common divisor of.
 * @param {number} num2 - 0
 * @returns The greatest common divisor of a and b.
 */
export function gcd(num1: number, num2: number): number {
  if (num2 === 0) {
    return num1;
  }
  return gcd(num2, num1 % num2);
}

/**
 * It finds the modular inverse of a number, which is the number that when multiplied by the original
 * number, gives you 1
 * @param {number} dividend - the number to find the inverse of
 * @param {number} divisor - the modulus
 * @returns The modular inverse of a modulo m.
 */
export function modularInverse(dividend: number, divisor: number): number {
  let originalDivisor = divisor;
  let previousDivisor = 1;
  let currentDivisor = 1;

  if (divisor === 1) {
    return 0;
  }

  while (dividend > 1) {
    const divisionResult = Math.floor(dividend / divisor);
    let remainder = divisor;

    divisor = dividend % divisor;
    dividend = remainder;
    remainder = previousDivisor;

    previousDivisor = currentDivisor - divisionResult * previousDivisor;
    currentDivisor = remainder;
  }

  if (currentDivisor < 0) {
    currentDivisor += originalDivisor;
  }

  return currentDivisor;
}

/**
 * "If the exponent is even, square the base and divide the exponent by 2. If the exponent is odd,
 * multiply the result by the base and subtract 1 from the exponent. Repeat until the exponent is 0."
 *
 * The above function is a bit more complicated than the naive approach, but it's still pretty simple.
 * It's also much faster
 * @param {number} base - the base number
 * @param {number} exponent - 65537
 * @param {number} modulus - the modulus we're using
 * @returns The modular exponentiation of base^exponent % modulus
 */
export function modPow(
  base: number,
  exponent: number,
  modulus: number
): number {
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

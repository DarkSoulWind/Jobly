import {
	generateKeys,
	encrypt,
	decrypt,
	generateRandomPrime,
} from "../lib/hash/RSA";
import { expect, test, describe } from "@jest/globals";

// TODO: generate keys when user logs in

function test1() {
	console.log("Generating random primes...");
	const prime1 = generateRandomPrime(1024);
	console.log("Generated first prime");
	const prime2 = generateRandomPrime(1024);
	console.log("Generated second prime, generating keys...");
	const keys = generateKeys(prime1, prime2);
	console.log("Generated keys");
	const publicKey = keys.publicKey;
	const privateKey = keys.privateKey;

	const message = "this is a test message";
	console.log(`message: ${message}`);
	console.log("Encrypting...");
	const encrypted = encrypt(message, publicKey);
	console.log("Encrypted, now decrypting...");
	const decrypted = decrypt(encrypted, privateKey);
	console.log(`Decrypted, message is: ${decrypted}`);
	return decrypted;
}

describe("encryption module", () => {
	test("test 1", () => {
		expect(test1()).toStrictEqual("this is a test message");
	});
	// test("test 1", () => {
	// 	expect(1 + 1).toBe(2);
	// });
});

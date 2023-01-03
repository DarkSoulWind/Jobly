import {
	generateKeys,
	encrypt,
	decrypt,
	generateRandomPrime,
} from "../lib/hash/RSA";

function main() {
	const prime1 = generateRandomPrime(1024);
	const prime2 = generateRandomPrime(1024);
	const keys = generateKeys(prime1, prime2);
	const publicKey = keys.publicKey;
	const privateKey = keys.privateKey;

	const message = "piggy biggins";
	const encrypted = encrypt(message, publicKey);
	const decrypted = decrypt(encrypted, privateKey);

	console.log(encrypted);
	console.log(decrypted);
}

main();

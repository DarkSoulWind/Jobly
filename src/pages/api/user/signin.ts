import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "src/lib/prisma";
import {
  generateKeys,
  generateRandomPrime,
  decrypt,
  encrypt,
} from "@lib/hash/RSA";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(500).json({ message: "Please use the POST method." });
    return;
  }

  console.log("🚀 ~ file: signin.ts:43 ~ body", req.body);
  const { email, password } = req.body as { [key: string]: string };

  // find if there is an existing user in the database that has the
  // same email and password
  try {
    const user = await prisma.user.findFirstOrThrow({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        image: true,
        key: {
          select: {
            priv: true,
          },
        },
      },
    });

    const privateKey = user?.key?.priv?.split(",").map((n) => parseInt(n))!;
    console.log(
      "file: signin.ts~line: 42~handler->encryptedPassword~password",
      user?.password
    );
    const encryptedPassword = user?.password
      ?.split(",")
      .map((n) => parseInt(n))!;
    console.log(
      "file: signin.ts~line: 42~handler->hashedPassword~hashedPassword",
      encryptedPassword
    );

    const decryptedPassword = decrypt(encryptedPassword, privateKey);
    console.log(
      "file: signin.ts~line: 38~handler->decryptedPassword~decryptedPassword",
      decryptedPassword
    );

    // check if the password is correct
    if (password == decryptedPassword) {
      console.log("Password matches, creating new hashes...");

      // if validated, generate new set of public and private keys and hash the password
      const p1 = generateRandomPrime(10),
        p2 = generateRandomPrime(10);
      const { privateKey, publicKey } = generateKeys(p1, p2);
      const newPassword = encrypt(password, publicKey);

      await prisma.user.update({
        where: { email },
        data: {
          password: newPassword.join(","),
          key: {
            update: {
              pub: publicKey.join(","),
              priv: privateKey.join(","),
            },
          },
        },
      });

      console.log("Hashes created, signing in...");
      res.status(200).json(user);
    } else {
      throw new Error("Incorrect email or password");
    }
  } catch (error) {
    console.error(error);
    console.log('file: signin.ts~line: 87~handler->error~error', error);
    res.status(404).json({ error });
  }
}

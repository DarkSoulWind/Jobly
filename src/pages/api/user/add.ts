"SIGNING UP A USER";

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@lib/prisma";
import { generateKeys, generateRandomPrime, encrypt } from "@lib/hash/RSA";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(500).json({ message: "Please use the POST method." });
    return;
  }

  const { username, email, password, confirmPassword } = req.body as {
    [key: string]: string;
  };

  // SERVER SIDE VALIDATION
  // checks if the email is in the right format
  if (!email?.match(/[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+/g)) {
    console.log("Email does not match the format.");
    res.status(500).json({ error: "Please enter a valid email." });
    return;
  }
  console.log(email, "matches the format");

  // checks if the passwords match
  if (password !== confirmPassword) {
    console.log("Passwords dont match");
    res.status(500).json({ error: "Passwords do not match." });
    return;
  }
  console.log("Passwords match!");

  // checks if the password is at least 8 characters long
  if (!password || password.length < 8) {
    console.log("The password must be at least 8 characters.");
    res
      .status(500)
      .json({ error: "The password must be at least 8 characters." });
    return;
  }

  // checks if the username exists
  if (!username) {
    console.log("Please enter a valid username.");
    res.status(500).json({ error: "Please enter a valid username." });
    return;
  }

  const p1 = generateRandomPrime(10),
    p2 = generateRandomPrime(10);
  const { publicKey, privateKey } = generateKeys(p1, p2);
  const encryptedPassword = encrypt(password, publicKey);

  try {
    const user = await prisma.user.create({
      data: {
        name: username,
        email,
        password: encryptedPassword.join(","),
        key: {
          create: {
            pub: publicKey.join(","),
            priv: privateKey.join(","),
          },
        },
      },
    });
    res.status(200).json(user);
  } catch (error) {
    console.error(error.meta.target);

    switch (error.meta.target) {
      case "User_email_key":
        res.status(500).json({ error: "Account with email already exists." });
        break;
      case "User_name_key":
        res.status(500).json({ error: "Account with username already exists." });
        break;
      default:
        res.status(500).json({ error: error.meta.target });
        break;
    }

    return;
  }
}

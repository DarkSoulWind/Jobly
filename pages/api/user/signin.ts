import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@lib/prisma";
import { createHash } from "node:crypto";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "POST") {
		res.status(500).json({ message: "Please use the POST method." });
		return;
	}

	console.log("🚀 ~ file: signin.ts:43 ~ body", req.body);
	const hash = createHash("sha256");
	const { email, password } = req.body;

	// find if there is an existing user in the database that has the
	// same email and password
	try {
		const user = await prisma.user.findUnique({
			where: { email },
			select: {
				id: true,
				name: true,
				email: true,
				password: true,
				image: true,
			},
		});

		if (user?.password == hash.update(password).digest("hex")) {
			console.log("Password matches, signing in...");
			res.status(200).json(user);
		} else {
			throw new Error("Incorrect email or password");
		}
	} catch (error) {
		console.error(error);
		res.status(404).json({ error });
	}
}

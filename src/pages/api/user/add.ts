import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "src/lib/prisma";
import { createHash } from "node:crypto";

const hash = createHash("sha256");

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "POST") {
		res.status(500).json({ message: "Please use the POST method." });
		return;
	}

	const { username, email, password } = req.body;

	try {
		const user = await prisma.user.create({
			data: {
				name: username,
				email,
				password: hashPass(password),
			},
		});
		res.status(200).json(user);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error });
	}
}

const hashPass = (password: string): string => {
	return hash.update(password).digest("hex");
};

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../lib/prisma";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { email } = req.query;
	const user = await prisma.user.findUnique({
		where: { email: email as string },
		include: {
			preferences: true,
			followers: true,
			following: true,
		},
	});

	if (!user) {
		res.status(404).json({ message: `User with email ${email} not found` });
	} else {
		res.status(200).json(user);
	}
}

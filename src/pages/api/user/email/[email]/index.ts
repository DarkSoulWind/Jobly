import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "src/lib/prisma";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { email } = req.query;
	const user = await prisma.user.findFirst({
		where: { email: email as string },
		select: {
			preferences: true,
			followers: true,
			following: true,
			id: true,
			password: false,
			phoneNumber: false,
			email: false,
			image: true,
			name: true,
		},
	});

	if (!user) {
		res.status(404).json({ message: `User with email ${email} not found` });
	} else {
		res.status(200).json(user);
	}
}

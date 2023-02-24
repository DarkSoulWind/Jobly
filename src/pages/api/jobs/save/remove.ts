import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "src/lib/prisma";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "POST") {
		res.status(405).json({ message: "Please use the POST method only." });
		return;
	}

	const { email, link } = JSON.parse(req.body) as {
		email: string;
		link: string;
	};

	const user = await prisma.user.findFirst({
		where: {
			email,
		},
		select: {
			id: true,
		},
	});

	const result = await prisma.savedJob.delete({
		where: {
			userID_link: {
				userID: user!.id,
				link,
			},
		},
	});
	res.status(200).json(result);
}

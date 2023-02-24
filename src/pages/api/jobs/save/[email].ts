import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "src/lib/prisma";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "GET") {
		res.status(405).json({ message: "Please use the GET method only." });
		return;
	}

	const { email } = req.query as { email: string };

	const result = await prisma.savedJob.findMany({
		where: {
			user: {
				email,
			},
		},
		orderBy: {
			dateAdded: "desc",
		},
	});

	res.status(200).json(result);
}

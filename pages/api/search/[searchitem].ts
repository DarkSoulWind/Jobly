import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@lib/prisma";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "GET")
		res.status(405).json({ message: "Please use the GET method." });
	else {
		const { searchitem } = req.query as { [key: string]: string };
		const users = await prisma.user.findMany({
			where: {
				OR: [
					{ name: { contains: searchitem } },
					{ preferences: { firstName: { contains: searchitem } } },
					{ preferences: { lastName: { contains: searchitem } } },
				],
			},
			select: {
				name: true,
				preferences: true,
			},
		});

		const results = { users };
		res.status(200).json(results);
	}
}

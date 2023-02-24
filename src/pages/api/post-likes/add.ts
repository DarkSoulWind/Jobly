import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "src/lib/prisma";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "POST") {
		res.status(500).json("Please use the POST method.");
	}
	const { userID, postID } = JSON.parse(req.body);
	try {
		const response = await prisma.postLike.create({
			data: {
				userID,
				postID,
			},
		});
		console.log("Created like", JSON.stringify(response, null, 4));
		res.status(200).json(response);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error });
	}
}

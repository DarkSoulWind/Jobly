import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@lib/prisma";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "POST") {
		res.status(500).json("Please use the POST method.");
	}
	const { userID, postID } = JSON.parse(req.body);

	const response = await prisma.postLike.delete({
		where: {
			userID_postID: {
				userID: userID,
				postID: postID,
			},
		},
	});

	if (!response) {
		res.status(404).json({ message: "Like not found." });
		return;
	}

	res.status(200).json(response);
}

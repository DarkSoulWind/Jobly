import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@lib/prisma";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "POST") {
		res.status(500).json({ message: "Please use the POST method." });
	} else {
		const {
			userID,
			postID,
			commentText,
		}: {
			userID: string;
			postID: string;
			commentText: string;
		} = JSON.parse(req.body);

		try {
			const response = await prisma.comment.create({
				data: {
					userID,
					postID,
					commentText,
				},
				include: {
					user: {
						select: {
							name: true,
							image: true,
							email: true,
							preferences: true,
						},
					},
				},
			});

			console.log("Created comment!", JSON.stringify(response, null, 4));
			res.status(200).json(response);
		} catch (error) {
			console.error(error);
			res.status(500).json({ error });
		}
	}
}

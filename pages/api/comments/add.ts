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
			UserID,
			PostID,
			DatePosted,
			CommentText,
		}: {
			UserID: string;
			PostID: string;
			DatePosted: string;
			CommentText: string;
		} = JSON.parse(req.body);

		try {
			const response = await prisma.comment.create({
				data: {
					userID: UserID,
					postID: PostID,
					datePosted: DatePosted,
					commentText: CommentText,
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

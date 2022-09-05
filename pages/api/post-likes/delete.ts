import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "POST") {
		res.status(500).json("Please use the POST method.");
	}
	const { UserID, PostID } = req.body;
	// CLAPPED
	// Find the like id of the post like from the userid and postid, then proceed to delete
	// the post like with that like id
	await prisma.postLikes
		.findFirst({
			where: {
				UserID,
				PostID,
			},
			select: {
				LikeID: true,
			},
		})
		.then(async (response) => {
			const LikeID = response?.LikeID as number;
			console.log("Found id", JSON.stringify(response, null, 4));
			await prisma.postLikes
				.delete({
					where: {
						LikeID,
					},
				})
				.then((response) => {
					console.log(
						"Deleted like",
						JSON.stringify(response, null, 4)
					);
					res.status(200).json({
						message: "Deleted like",
						...response,
					});
				})
				.catch((error) => {
					console.error(error);
					res.status(500).json({ error });
				});
		})
		.catch((error) => {
			console.error(error);
			res.status(404).json({ error });
		});
}

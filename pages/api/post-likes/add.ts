import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "POST") {
		res.status(500).json("Please use the POST method.");
	}
	const { UserID, PostID } = JSON.parse(req.body);
	try {
		await prisma.postLikes
			.create({
				data: {
					UserID,
					PostID,
				},
			})
			.then((response) => {
				console.log("Created like", JSON.stringify(response, null, 4));
				res.status(200).json(response);
			})
			.catch((error) => {
				throw new Error(error);
			});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error });
	}
}

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@lib/prisma";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "POST") {
		res.status(500).json({ message: "Please use the POST method." });
	} else {
		const { postID } = req.query;
		await prisma.post
			.delete({
				where: {
					id: postID as string,
				},
			})
			.then((response) => {
				console.log("Post deleted", JSON.stringify(response, null, 4));
				res.status(200).json(response);
			})
			.catch((error) => {
				console.error(error);
				res.status(404).json(error);
			});
	}
}

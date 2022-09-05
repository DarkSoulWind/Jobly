import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "POST") {
		res.status(500).json({ message: "Please use the POST method." });
	} else {
		const { CommentID } = JSON.parse(req.body);
		await prisma.comments
			.delete({
				where: {
					CommentID,
				},
			})
			.then((response) => {
				console.log(
					"Deleted response",
					JSON.stringify(response, null, 4)
				);
				res.status(200).json(response);
			})
			.catch((error) => {
				console.error(error);
				res.status(404).json({ error });
			});
	}
}

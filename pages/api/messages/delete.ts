import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@lib/prisma";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "POST") {
		res.status(405).json({ message: "Please use the POST method." });
	} else {
		const { messageID } = req.query;
		await prisma.message
			.delete({
				where: {
					id: messageID as string,
				},
			})
			.then((response) => {
				console.log(
					"Deleted message",
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

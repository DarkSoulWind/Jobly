import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "GET") {
		res.status(405).json({ message: "Please use the GET method." });
	} else {
		const { chatID } = req.query;
		await prisma.message
			.findMany({
				where: {
					ChatID: chatID as string,
				},
				select: {
					MessageID: true,
					Text: true,
					DatePosted: true,
					Received: true,
					Sender: {
						select: {
							name: true,
							image: true,
							password: false,
						},
					},
				},
				orderBy: {
					DatePosted: "asc",
				},
			})
			.then((response) => {
				res.status(200).json(response);
			})
			.catch((error) => {
				console.error(error);
				res.status(404).json({ error });
			});
	}
}

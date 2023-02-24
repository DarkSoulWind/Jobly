import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "src/lib/prisma";
import { encrypt } from "src/lib/hash";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "GET") {
		res.status(405).json({ message: "Please use the GET method." });
	} else {
		const { chatID } = req.query as { chatID: string };
		await prisma.message
			.findMany({
				where: {
					chatID,
				},
				select: {
					id: true,
					text: true,
					datePosted: true,
					received: true,
					sender: {
						select: {
							name: true,
							image: true,
							password: false,
						},
					},
					cipher: {
						select: {
							key: true,
						},
					},
				},
				orderBy: {
					datePosted: "asc",
				},
			})
			.then((response) => {
				res.status(200).json(
					response.map((message) => {
						return {
							...message,
							text: encrypt(message.text, message.cipher!.key),
						};
					})
				);
			})
			.catch((error) => {
				console.error(error);
				res.status(404).json({ error });
			});
	}
}

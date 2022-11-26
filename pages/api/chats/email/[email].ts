import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@lib/prisma";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "GET") {
		res.status(405).json({ message: "Please use the POST method only." });
	} else {
		const { email } = req.query;

		await prisma.chat
			.findMany({
				where: {
					participants: {
						some: {
							user: {
								email: email as string,
							},
						},
					},
				},
				include: {
					participants: {
						include: {
							user: {
								select: {
									name: true,
									image: true,
									online: true,
									password: false,
								},
							},
						},
					},
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

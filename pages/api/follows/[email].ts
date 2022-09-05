import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "GET") {
		res.status(405).json({ message: "Please use the GET method." });
	} else {
		const { email } = req.query;
		await prisma.user
			.findFirst({
				where: {
					email: email as string,
				},
				select: {
					followers: {
						select: {
							followerId: false,
							followingId: false,
							follower: {
								select: {
									id: true,
									name: true,
									image: true,
									password: false,
								},
							},
						},
					},
					following: {
						select: {
							followerId: false,
							followingId: false,
							following: {
								select: {
									id: true,
									name: true,
									image: true,
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

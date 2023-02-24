import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "src/lib/prisma";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "POST") {
		res.status(500).json({ message: "Please use the POST method." });
	} else {
		const {
			followerId,
			followingId,
		}: { followerId: string; followingId: string } = JSON.parse(req.body);
		await prisma.follow
			.delete({
				where: { followerId_followingId: { followerId, followingId } },
				select: {
					followerId: true,
					follower: true,
				},
			})
			.then((response) => {
				console.log(
					"Deleted follow!",
					JSON.stringify(response, null, 4)
				);
				res.status(200).json(response);
			})
			.catch((error) => {
				console.error(error);
				res.status(500).json({ error });
			});
	}
}

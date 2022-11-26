import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@lib/prisma";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "POST") {
		res.status(405).json({ message: "Please use the POST method only." });
		return;
	}

	const { SavedJobID } = JSON.parse(req.body) as {
		SavedJobID: string;
	};

	const result = await prisma.savedJob.delete({
		where: {
			id: SavedJobID,
		},
	});
	res.status(200).json(result);
}

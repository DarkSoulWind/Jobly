import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "src/lib/prisma";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "POST") {
		res.status(405).end({ message: "Please use the POST method only." });
		return;
	}

	const { link, email, title, employer, location, description, type } =
		JSON.parse(req.body) as {
			[key: string]: string;
		};
	console.log("Request body:", JSON.stringify(JSON.parse(req.body), null, 4));

	const UserID = await prisma.user.findFirst({
		where: {
			email,
		},
		select: {
			id: true,
		},
	});

	if (!UserID) {
		res.status(500).end({
			message: `Unable to find user with email ${email}.`,
		});
		return;
	}

	console.log("Found user with email", email);

	const result = await prisma.savedJob.create({
		data: {
			link,
			title,
			employer,
			location,
			type,
			description: description.slice(0, 127),
			userID: UserID.id,
		},
	});

	res.status(200).json(result);
}

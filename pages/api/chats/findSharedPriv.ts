import { request } from "http";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

// finds whether a user shares a chat with another user
// if not then we'll have to make one in another route
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "POST") {
		res.status(405).json({ message: "Please use the POST method." });
	} else {
		const { userid1, userid2 } = JSON.parse(req.body);
		// find all participants from userid1 and userid2 and see if they share a chat
		console.log(userid1, userid2);
		const user1 = await prisma.participant.findMany({
			where: {
				UserID: userid1,
			},
		});
		const user2 = await prisma.participant.findMany({
			where: {
				UserID: userid2,
			},
		});
		const user1chatids = user1.map((participant) => participant.ChatID);
		const user2chatids = user2.map((participant) => participant.ChatID);
		user1chatids.forEach((chatid) => {
			if (user2chatids.includes(chatid)) {
				res.status(200).end(JSON.stringify({ exists: true, chatid }));
			}
		});
		res.status(404).json({ exists: false });
	}
}

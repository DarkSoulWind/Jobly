import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "src/lib/prisma";

// create a new chat
// add new participants
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "POST") {
		res.status(405).json({ message: "Please use the POST method." });
	} else {
		const {
			chatid,
			chatname,
			participants,
		}: {
			chatid: string;
			chatname: string;
			participants: { userid: string }[];
		} = JSON.parse(req.body);

		await prisma.chat
			.create({
				data: {
					id: chatid,
					name: chatname,
				},
			})
			.then(async (response) => {
				return await prisma.participant.createMany({
					// creates participants records based on the array of participants from the request body
					data: [
						...participants.map((participant) => ({
							userID: participant.userid,
							chatID: response.id,
						})),
					],
				});
			})
			.then((response) => {
				res.status(200).json(response);
			})
			.catch((error) => {
				console.error(error);
				res.status(500).json({ error });
			});
	}
}

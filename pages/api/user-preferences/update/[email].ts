import { NotFoundError } from "@prisma/client/runtime";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@lib/prisma";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "PUT") {
		res.status(500).json("Please use the PUT method only.");
	} else {
		const { email } = req.query;
		const {
			firstName,
			lastName,
			pronouns,
			bio,
			countryRegion,
			postalCode,
			city,
			school,
			phoneNumber,
			phoneType,
		} = JSON.parse(req.body);
		const updatedPreferences = {
			firstName,
			lastName,
			pronouns,
			bio,
			countryRegion,
			postalCode,
			city,
			school,
			phoneType,
		};
		let data = {};
		// First find the user id using the email
		console.log("Finding user with email", email);
		await prisma.user
			.findUnique({
				where: { email: email as string },
				select: { id: true, name: true },
			})
			.then(async (response) => {
				const id = response?.id as string;
				console.log("Found user id", id, "from", response?.name);
				// Try to update the preferences first, if there is an error that means there are no preferences
				// for that user. In this case we will have to create the preferences.
				await prisma.userPreference
					.update({
						where: {
							userID: id,
						},
						data: {
							...updatedPreferences,
						},
					})
					.then((response) => {
						console.log(
							"updated user preferences",
							JSON.stringify(response, null, 4)
						);
						data = response;
					})
					.catch(async (error: NotFoundError) => {
						console.log(
							"Not preferences for this user so creating them"
						);
						await prisma.userPreference
							.create({
								data: {
									userID: id,
									...updatedPreferences,
								},
							})
							.then((response) => {
								console.log(
									"Created preferences",
									JSON.stringify(response)
								);
								data = response;
							})
							.catch((error) => {
								console.error(
									"Error creating preferences",
									error
								);
								res.status(500).json(error);
							});
					})
					.finally(async () => {
						await prisma.user
							.update({
								where: {
									id,
								},
								data: {
									phoneNumber,
								},
								select: {
									phoneNumber: true,
									name: true,
									email: true,
								},
							})
							.then((response) => {
								console.log(
									"updated user",
									JSON.stringify(response, null, 4)
								);
								res.status(200).json({ ...data, ...response });
							})
							.catch((error) => {
								console.error("Error updating user");
								res.status(500).json({ error });
							});
					});
			})
			.catch((error) => {
				console.error(error);
				res.status(404).json(error);
			});
	}
}

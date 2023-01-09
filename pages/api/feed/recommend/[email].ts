import type { NextApiRequest, NextApiResponse } from "next";
import { Edge, GraphNode, dijkstra } from "@lib/graph";
import { prisma } from "@lib/prisma";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "GET") {
		res.status(405).json({ message: "Please use the GET method." });
	} else {
		const { email } = req.query;

		const userData = await prisma.user.findMany({
			select: {
				id: true,
				name: true,
				email: true,
				following: {
					select: {
						following: {
							select: {
								id: true,
								name: true,
							},
						},
					},
				},
				posts: {
					include: {
						user: {
							select: {
								name: true,
								image: true,
								password: false,
							},
						},
						postLikes: {
							select: {
								userID: true,
								postID: true,
							},
						},
					},
				},
				postLikes: {
					select: {
						post: {
							select: {
								user: {
									select: {
										id: true,
										name: true,
									},
								},
							},
						},
					},
				},
				_count: {
					select: {
						following: true,
						postLikes: true,
					},
				},
			},
		});

		const userNodes = userData.map(
			(user) => new GraphNode("user", { ...user })
		);

		const getUserNodeByID = (id: string) => {
			return userNodes.find((node) => node.get("id") === id);
		};

		const followEdges = userNodes.flatMap((userNode) => {
			return userNode.get("following").map(({ following }) => {
				return new Edge("following", { ...following })
					.link(userNode, getUserNodeByID(following.id)!)
					.setWeight(3);
			});
		});

		const postLikeEdges = userNodes.flatMap((userNode) => {
			return userNode.get("postLikes").map(({ post: { user } }) => {
				if (userNode.get("name") === user.name) return [];
				return new Edge("liked post", { ...user })
					.link(userNode, getUserNodeByID(user.id)!)
					.setWeight(1);
			});
		});

		const startNode = userNodes.find(
			(node) => node.get("email") === email
		)!;
		const distances = dijkstra(userNodes, startNode);
		const recommendedPosts = Object.entries(distances).flatMap(
			([id, distance]) => {
				// dont return the user data if there is no relationship (distance is Infinity)
				if (distance === Infinity) return [];
				return userData.find((user) => user.id === id)!.posts;
			}
		);
		recommendedPosts.sort((a, b) => {
			if (a.datePosted > b.datePosted) return -1;
			else if (a.datePosted < b.datePosted) return 1;
			else return 0;
		});

		res.status(200).json(recommendedPosts);
	}
}

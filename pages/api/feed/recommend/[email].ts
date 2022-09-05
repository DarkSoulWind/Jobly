import { Posts } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { Edge, getUserNodeByID, GraphNode } from "../../../../lib/graph";
import { prisma } from "../../../../lib/prisma";

function BFS(root: GraphNode) {
	const visited = new Set<GraphNode>();
	const queue = [root];
	console.log("starting from", root.toString());

	while (queue.length > 0) {
		const poppedNode = queue.shift() as GraphNode;
		const linkedEdges = poppedNode.edges;

		for (const edge of linkedEdges) {
			const outputNode = edge.outputNode as GraphNode;
			if (!visited.has(outputNode)) {
				visited.add(outputNode);
				queue.push(outputNode as GraphNode);
				// console.log(outputNode?.toString());
			}
		}
	}
	return visited;
}
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "GET") {
		res.status(405).json({ message: "Please use the GET method." });
	} else {
		const { email } = req.query;

		// 1.	Select up to 50 users from the database which you share interests with,
		// liked a post by or follow.
		// const users = await prisma.user.findMany({
		// 	where: {
		// 		OR: [
		// 			{ email: email as string },
		// 			{
		// 				postLikes: {
		// 					some: {
		// 						User: {
		// 							email: { equals: email as string },
		// 						},
		// 					},
		// 				},
		// 			},
		// 			// people who are following you
		// 			{
		// 				following: {
		// 					some: {
		// 						// person who they are following has your email
		// 						following: {
		// 							email: { equals: email as string },
		// 						},
		// 					},
		// 				},
		// 			},
		// 			{
		// 				followers: {
		// 					some: {
		// 						follower: {
		// 							email: { equals: email as string },
		// 						},
		// 					},
		// 				},
		// 			},
		// 		],
		// 	},

		// 	select: {
		// 		name: true,
		// 		id: true,
		// 		following: {
		// 			select: {
		// 				following: {
		// 					select: { name: true, id: true },
		// 				},
		// 			},
		// 		},
		// 		postLikes: {
		// 			select: {
		// 				User: {
		// 					select: {
		// 						password: false,
		// 						id: true,
		// 						name: true,
		// 					},
		// 				},
		// 			},
		// 		},
		// 	},
		// });

		const users = await prisma.user.findMany({
			select: {
				name: true,
				id: true,
				email: true,
				posts: {
					select: {
						PostID: true,
						UserID: true,
						DatePosted: true,
						PostText: true,
						Image: true,
						ImageRef: true,
						User: {
							select: {
								password: false,
								name: true,
								image: true,
								preferences: true,
							},
						},
						PostLikes: true,
						Comments: true,
					},
				},
				following: {
					select: {
						following: {
							select: { name: true, id: true },
						},
					},
				},
				postLikes: {
					select: {
						User: {
							select: {
								password: false,
								id: true,
								name: true,
							},
						},
					},
				},
			},
			take: 50,
		});

		const userNodes = users.map((user) => {
			return new GraphNode("user", { ...user });
		});

		const followEdges = userNodes.flatMap((userNode) =>
			userNode
				.get("following")
				.map(
					({
						following,
					}: {
						following: { name: string; id: string };
					}) =>
						new Edge("following").link(
							userNode,
							getUserNodeByID(
								userNodes,
								following.id
							) as GraphNode
						)
				)
		);

		// const postLikeEdges = userNodes.flatMap((userNode) =>
		// 	userNode
		// 		.get("PostLikes")
		// 		.map(({ User }: { User: { id: string; name: string } }) =>
		// 			new Edge("post-like").link(
		// 				userNode,
		// 				getUserNodeByID(userNodes, User.id) as GraphNode
		// 			)
		// 		)
		// );

		// do a breadth first search starting from the user with the right email
		const recommendedUsers = BFS(
			userNodes.find(
				(userNode) => userNode.get("email") === email
			) as GraphNode
		);
		const recommendedUsersArray = Array.from(recommendedUsers).map((node) =>
			JSON.parse(node.toString())
		);
		const recommendedPosts = recommendedUsersArray
			.flatMap(
				({ properties }: { properties: { posts: Posts[] } }) =>
					properties.posts
			)
			.sort((a, b) => {
				if (a.DatePosted > b.DatePosted) return -1;
				else if (a.DatePosted < b.DatePosted) return 1;
				else return 0;
			});

		// console.log(recommendedUsers);

		res.status(200).json(recommendedPosts);
	}
}

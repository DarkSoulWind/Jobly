import { GraphNode, Edge, getWeightForID, dijkstra } from "../lib/graph";
import { prisma } from "../lib/prisma";

async function main() {
	// Select following, post likes and posts from users.
	const userData = await prisma.user.findMany({
		select: {
			id: true,
			name: true,
			posts: true,
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

	const distances = dijkstra(userNodes, userNodes[1]);
	const recommendedPosts = Object.entries(distances).flatMap(
		([id, distance]) => {
			return userData.find((user) => user.id === id)!.posts;
		}
	);
	console.log(recommendedPosts);
}

main();

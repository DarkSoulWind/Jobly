import { prisma } from "./prisma";

// function BFS<T extends { [key: string]: any }>(root: GraphNode<T>) {
// 	const visited = new Set();
// 	const queue = [root];
// 	console.log("starting from", root.toString());

// 	while (queue.length > 0) {
// 		const poppedNode = queue.shift() as GraphNode<any>;
// 		const linkedEdges = poppedNode.edges;

// 		for (const edge of linkedEdges) {
// 			const outputNode = edge.outputNode;
// 			if (!visited.has(outputNode)) {
// 				visited.add(outputNode);
// 				queue.push(outputNode as GraphNode<any>);
// 				console.log(outputNode?.toString());
// 			}
// 		}
// 	}
// }

// function dijkstra<T extends { [key: string]: any }>(vertices: GraphNode<T>[], start: string) {
// 	if (!Object.keys(vertices).includes(start)) {
// 		console.log("Node does not exist.")
// 		return;
// 	}

// 	const distances: { [key: string]: number } = {};
// 	distances[start] = 0

// 	const queue: VertexData[] = [];
// 	for (const vertex of Object.keys(vertices)) {
// 		if (start !== vertex) {
// 			distances[vertex] = vertices[start][vertex] ?? Infinity;
// 		}
// 		queue.push({ vertex, distance: distances[vertex] })
// 	}

// 	while (queue.length > 0) {
// 		queue.sort((a, b) => {
// 			if (a.distance < b.distance) return -1
// 			else if (a.distance > b.distance) return 1
// 			else return 0
// 		})
// 		const node = queue.shift() as VertexData;

// 		for (const neighbour of Object.keys(vertices[node.vertex])) {
// 			const alt = distances[node.vertex] + vertices[node.vertex][neighbour];
// 			console.log(`${distances[node.vertex]} + ${vertices[node.vertex][neighbour]} = ${alt}`)
// 			console.log(`Distance from ${node.vertex} to ${neighbour}: ${alt}`)
// 			if (alt < distances[neighbour]) {
// 				distances[neighbour] = alt
// 			}
// 		}
// 	}

// 	return distances
// }

// async function main() {
// 1.	Select up to 50 users from the database which you share interests with,
// liked a post by or follow.
// 	const users = await prisma.user.findMany({
// 		select: {
// 			name: true,
// 			id: true,
// 			following: {
// 				select: {
// 					following: {
// 						select: { name: true, id: true },
// 					},
// 				},
// 			},
// 			postLikes: {
// 				select: {
// 					User: {
// 						select: {
// 							password: false,
// 							id: true,
// 							name: true,
// 						},
// 					},
// 				},
// 			},
// 		},
// 		take: 50,
// 	});

// 	const userNodes = users.map((user) => new GraphNode("user", { ...user }));
// 	// userNodes.forEach((userNode) => console.log(userNode.toString()));

// 	const followEdges = userNodes.flatMap((userNode) =>
// 		userNode
// 			.get("following")
// 			.map(({ following }: { following: { name: string; id: string } }) =>
// 				new Edge("follow", {}).link(
// 					userNode,
// 					getUserNodeByID(userNodes, following.id)!
// 				)
// 			)
// 	);

// 	// followEdges.forEach((followEdge) => console.log(followEdge.toString()));

// 	const postLikeEdges = userNodes.flatMap((userNode) =>
// 		userNode
// 			.get("postLikes")
// 			.map(({ User }) =>
// 				new Edge("post-like", {}).link(
// 					userNode,
// 					getUserNodeByID(userNodes, User.id)!
// 				)
// 			)
// 	);

// 	BFS(userNodes[0]);
// }

// main();

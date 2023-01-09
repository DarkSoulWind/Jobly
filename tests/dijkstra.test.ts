import { GraphNode, Edge, dijkstra } from "../lib/graph";
import { expect, test, describe } from "@jest/globals";

interface MockUser {
	id: string;
	name: string;
	posts: {
		id: `${number}-${number}`;
		userID: string;
		postText: string;
	}[];
	following: {
		following: {
			id: string;
		};
	}[];
	postLikes: {
		post: {
			id: `${number}-${number}`;
			user: {
				id: string;
			};
		};
	}[];
}

const test1NUserData: MockUser[] = [
	{
		id: "1",
		name: "Salman",
		posts: [
			{ id: "1-1", userID: "1", postText: "Salman's first post" },
			{ id: "1-2", userID: "1", postText: "Salman's second post" },
		],
		following: [],
		postLikes: [
			{ post: { id: "2-1", user: { id: "2" } } },
			{ post: { id: "2-2", user: { id: "2" } } },
		],
	},
	{
		id: "2",
		name: "Balman",
		posts: [
			{ id: "2-1", userID: "2", postText: "Balman's first post" },
			{ id: "2-2", userID: "2", postText: "Balman's second post" },
		],
		following: [],
		postLikes: [],
	},
];

const test1BUserData: MockUser[] = [
	{
		id: "1",
		name: "Salman",
		posts: [
			{ id: "1-1", userID: "1", postText: "Salman's first post" },
			{ id: "1-2", userID: "1", postText: "Salman's second post" },
		],
		following: [],
		postLikes: [],
	},
	{
		id: "2",
		name: "Balman",
		posts: [
			{ id: "2-1", userID: "1", postText: "Salman's first post" },
			{ id: "2-2", userID: "1", postText: "Salman's second post" },
		],
		following: [],
		postLikes: [],
	},
];

const test2NUserData: MockUser[] = [
	{
		id: "1",
		name: "Salman",
		posts: [{ id: "1-1", userID: "1", postText: "Salman's first post" }],
		following: [],
		postLikes: [
			{ post: { id: "2-1", user: { id: "2" } } },
			{ post: { id: "3-1", user: { id: "3" } } },
			{ post: { id: "4-1", user: { id: "4" } } },
		],
	},

	{
		id: "2",
		name: "Balman",
		posts: [{ id: "2-1", userID: "2", postText: "Balman's first post" }],
		following: [],
		postLikes: [
			{ post: { id: "1-1", user: { id: "1" } } },
			{ post: { id: "3-1", user: { id: "3" } } },
			{ post: { id: "4-1", user: { id: "4" } } },
		],
	},

	{
		id: "3",
		name: "Walman",
		posts: [{ id: "3-1", userID: "3", postText: "Walman's first post" }],
		following: [],
		postLikes: [
			{ post: { id: "1-1", user: { id: "1" } } },
			{ post: { id: "2-1", user: { id: "2" } } },
			{ post: { id: "4-1", user: { id: "4" } } },
		],
	},

	{
		id: "4",
		name: "Dalman",
		posts: [{ id: "4-1", userID: "4", postText: "Dalman's first post" }],
		following: [],
		postLikes: [
			{ post: { id: "1-1", user: { id: "1" } } },
			{ post: { id: "2-1", user: { id: "2" } } },
			{ post: { id: "3-1", user: { id: "3" } } },
		],
	},
];

const test2BUserData: MockUser[] = [
	{
		id: "1",
		name: "Salman",
		posts: [{ id: "1-1", userID: "1", postText: "Salman's first post" }],
		following: [],
		postLikes: [{ post: { id: "1-1", user: { id: "1" } } }],
	},

	{
		id: "2",
		name: "Balman",
		posts: [{ id: "2-1", userID: "2", postText: "Balman's first post" }],
		following: [],
		postLikes: [{ post: { id: "2-1", user: { id: "2" } } }],
	},

	{
		id: "3",
		name: "Walman",
		posts: [{ id: "3-1", userID: "3", postText: "Walman's first post" }],
		following: [],
		postLikes: [{ post: { id: "3-1", user: { id: "3" } } }],
	},

	{
		id: "4",
		name: "Dalman",
		posts: [{ id: "4-1", userID: "4", postText: "Dalman's first post" }],
		following: [],
		postLikes: [{ post: { id: "4-1", user: { id: "4" } } }],
	},
];

/**
 * We create a graph of users and their connections, then we run Dijkstra's algorithm on the graph to
 * find the shortest path from the first user to all other users
 * @param {MockUser[]} userData - MockUser[] - this is the data that we're going to use to create our
 * graph.
 * @returns The shortest path from the first user to all other users
 */
function testDijkstra(userData: MockUser[]) {
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
		return userNode.get("postLikes").map(({ post }) => {
			// if the user liked their own post then ignore
			if (userNode.get("id") === post.user.id) return [];

			// const predicate = userNodes.find(userNode => userNode.get("posts").find(findPost => findPost.id === post.id  ))

			return new Edge("liked post", { ...post.user })
				.link(userNode, getUserNodeByID(post.user.id)!)
				.setWeight(1);
		});
	});

	return dijkstra(userNodes, userNodes[0]);
}

describe("dijkstra module", () => {
	test("Test 1 Normal", () => {
		expect(testDijkstra(test1NUserData)).toStrictEqual({ 1: 0, 2: 2 });
	});

	test("Test 1 Boundary", () => {
		expect(testDijkstra(test1BUserData)).toStrictEqual({
			1: 0,
			2: Infinity,
		});
	});

	test("Test 2 Normal", () => {
		expect(testDijkstra(test2NUserData)).toStrictEqual({
			1: 0,
			2: 1,
			3: 1,
			4: 1,
		});
	});

	test("Test 2 Boundary", () => {
		expect(testDijkstra(test2BUserData)).toStrictEqual({
			1: 0,
			2: Infinity,
			3: Infinity,
			4: Infinity,
		});
	});
});

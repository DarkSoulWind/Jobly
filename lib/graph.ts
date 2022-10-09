import { prisma } from "./prisma";

/* A generic class that can be used to create a node or an edge. */
abstract class Unit<T extends { [key: string]: any } = {}> {
	constructor(protected entity: string, protected properties: T) {}

	load(properties: T): Unit<T> {
		this.properties = { ...properties };
		return this;
	}

	set(property: keyof T, value: T[keyof T]): void {
		this.properties[property] = value;
	}

	unset(property: keyof T): void {
		delete this.properties[property];
	}

	has(property: string): boolean {
		return Object.prototype.hasOwnProperty.call(this.properties, property);
	}

	get<V extends keyof T>(property: V): T[V] {
		return this.properties[property];
	}

	toString(): string {
		return `{"type": "${this.entity}", "properties": ${JSON.stringify(
			this.properties,
			null,
			4
		)}}`;
	}
}

/* `GraphNode` is a `Unit` that has a list of `Edge`s */
export class GraphNode<T extends { [key: string]: any } = {}> extends Unit<T> {
	public readonly edges: Edge<any>[];
	public inputEdges: Edge<any>[];
	public outputEdges: Edge<any>[];

	constructor(entity: string, properties: T) {
		super(entity, properties);
		this.edges = [];
		this.inputEdges = [];
		this.outputEdges = [];
	}

	unlink(): void {
		for (const edge of this.edges) {
			edge.unlink();
		}
	}

	toString(): string {
		return JSON.stringify(
			{ type: this.entity, properties: this.properties },
			null,
			4
		);
	}
}

/* An Edge is a connection between two nodes, and it can be directed or undirected */
export class Edge<T extends { [key: string]: any } = {}> extends Unit<T> {
	private _inputNode: GraphNode<any> | null;
	private _outputNode: GraphNode<any> | null;
	private duplex: boolean;
	private _distance: number;

	constructor(entity: string, properties: T) {
		super(entity, properties);
		this._inputNode = null;
		this._outputNode = null;
		this.duplex = false;
		this._distance = 1;
	}

	get inputNode(): GraphNode<any> | null {
		return this._inputNode;
	}
	get outputNode(): GraphNode<any> | null {
		return this._outputNode;
	}

	// link a specific node in a certain direction
	private linkTo(node: GraphNode<any>, direction: number): void {
		// if direction is -1, then edge points to input node
		if (direction <= 0) node?.inputEdges.push(this);

		// if direction is 1, then edge points to output node
		if (direction >= 0) node?.outputEdges.push(this);
		// if direction is 0 then the edge is duplex (undirected)

		node?.edges.push(this);
	}

	// link two nodes, optionally make edge duplex (undirected)
	link(
		inputNode: GraphNode<any>,
		outputNode: GraphNode<any>,
		duplex: boolean = false
	): Edge<T> {
		this.unlink();

		this._inputNode = inputNode;
		this._outputNode = outputNode;
		this.duplex = duplex;

		this.linkTo(inputNode, duplex ? 0 : 1);
		this.linkTo(outputNode, duplex ? 0 : -1);
		return this;
	}

	// distance for traversal
	set distance(value: number) {
		this._distance = value;
	}

	// weight is 1 / distance
	set weight(value: number) {
		this._distance = 1 / value;
	}

	// find the opposite node given a starting node
	oppositeNode<S extends { [key: string]: any }>(
		node: GraphNode<S>
	): GraphNode<any> | null {
		if (this._inputNode === node) return this._outputNode;
		else if (this._outputNode === node) return this._inputNode;

		return null;
	}

	// remove connections from nodes
	unlink(): void {
		let pos;
		let inode = this._inputNode;
		let onode = this._outputNode;

		if (!(inode && onode)) return;

		(pos = inode.edges.indexOf(this)) > -1 && inode.edges.splice(pos, 1);
		(pos = onode.edges.indexOf(this)) > -1 && onode.edges.splice(pos, 1);
		(pos = inode.outputEdges.indexOf(this)) > -1 &&
			inode.outputEdges.splice(pos, 1);
		(pos = onode.inputEdges.indexOf(this)) > -1 &&
			onode.inputEdges.splice(pos, 1);

		if (this.duplex) {
			(pos = inode.inputEdges.indexOf(this)) > -1 &&
				inode.inputEdges.splice(pos, 1);
			(pos = onode.outputEdges.indexOf(this)) > -1 &&
				onode.outputEdges.splice(pos, 1);
		}

		this._inputNode = null;
		this._outputNode = null;

		this.duplex = false;
	}

	toString(): string {
		return `\n${this.constructor.name} (${this.entity} ${JSON.stringify(
			this.properties,
			null,
			4
		)},\n Input node: ${this._inputNode?.toString()},\n Output node: ${this._outputNode?.toString()}`;
	}
}

export function getUserNodeByID<T extends { [key: string]: any; id: string }>(
	nodes: GraphNode<T>[],
	id: string
): GraphNode<T> | undefined {
	return nodes.find((node) => node.get("id") === id);
}

function BFS<T extends { [key: string]: any }>(root: GraphNode<T>) {
	const visited = new Set();
	const queue = [root];
	console.log("starting from", root.toString());

	while (queue.length > 0) {
		const poppedNode = queue.shift() as GraphNode<any>;
		const linkedEdges = poppedNode.edges;

		for (const edge of linkedEdges) {
			const outputNode = edge.outputNode;
			if (!visited.has(outputNode)) {
				visited.add(outputNode);
				queue.push(outputNode as GraphNode<any>);
				console.log(outputNode?.toString());
			}
		}
	}
}

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

async function main() {
	// 1.	Select up to 50 users from the database which you share interests with,
	// liked a post by or follow.
	const users = await prisma.user.findMany({
		select: {
			name: true,
			id: true,
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

	const userNodes = users.map((user) => new GraphNode("user", { ...user }));
	// userNodes.forEach((userNode) => console.log(userNode.toString()));

	const followEdges = userNodes.flatMap((userNode) =>
		userNode
			.get("following")
			.map(({ following }: { following: { name: string; id: string } }) =>
				new Edge("follow", {}).link(
					userNode,
					getUserNodeByID(userNodes, following.id)!
				)
			)
	);

	// followEdges.forEach((followEdge) => console.log(followEdge.toString()));

	const postLikeEdges = userNodes.flatMap((userNode) =>
		userNode
			.get("postLikes")
			.map(({ User }) =>
				new Edge("post-like", {}).link(
					userNode,
					getUserNodeByID(userNodes, User.id)!
				)
			)
	);

	BFS(userNodes[0]);
}

main();

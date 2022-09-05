import { prisma } from "./prisma";

// we make it abstract because we only want this class to be inherited but not instantiated
abstract class Unit {
	constructor(
		protected entity: string,
		protected properties: { [key: string]: any }
	) {}

	load(properties: { [key: string]: any }): Unit {
		this.properties = { ...properties };
		return this;
	}

	set(property: string, value: any): void {
		this.properties[property] = value;
	}

	unset(property: string): void {
		this.properties[property] = undefined;
	}

	has(property: string): boolean {
		return Object.prototype.hasOwnProperty.call(this.properties, property);
	}

	get(property: string): any {
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

export class GraphNode extends Unit {
	public readonly edges: Edge[];
	public inputEdges: Edge[];
	public outputEdges: Edge[];

	constructor(entity: string, properties: { [key: string]: any } = {}) {
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
		return `{"type": "${this.entity}", "properties": ${JSON.stringify(
			this.properties,
			null,
			4
		)} }`;
	}
}

export class Edge extends Unit {
	private _inputNode: GraphNode | null;
	private _outputNode: GraphNode | null;
	private duplex: boolean;
	private _distance: number;

	constructor(entity: string, properties: { [key: string]: any } = {}) {
		super(entity, properties);
		this._inputNode = null;
		this._outputNode = null;
		this.duplex = false;
		this._distance = 1;
	}

	get inputNode(): GraphNode | null {
		return this._inputNode;
	}
	get outputNode(): GraphNode | null {
		return this._outputNode;
	}

	// link a specific node in a certain direction
	private linkTo(node: GraphNode, direction: number): void {
		// if direction is -1, then edge points to input node
		if (direction <= 0) node?.inputEdges.push(this);

		// if direction is 1, then edge points to output node
		if (direction >= 0) node?.outputEdges.push(this);
		// if direction is 0 then the edge is duplex (undirected)

		node?.edges.push(this);
	}

	// link two nodes, optionally make edge duplex (undirected)
	link(
		inputNode: GraphNode,
		outputNode: GraphNode,
		duplex: boolean = false
	): Edge {
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
	oppositeNode(node: GraphNode): GraphNode | null {
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

export const getUserNodeByID = (
	nodes: GraphNode[],
	id: string
): GraphNode | undefined => {
	return nodes.find((node) => node.get("id") === id);
};

function BFS(root: GraphNode) {
	const visited = new Set();
	const queue = [root];
	console.log("starting from", root.toString());

	while (queue.length > 0) {
		const poppedNode = queue.shift() as GraphNode;
		const linkedEdges = poppedNode.edges;

		for (const edge of linkedEdges) {
			const outputNode = edge.outputNode;
			if (!visited.has(outputNode)) {
				visited.add(outputNode);
				queue.push(outputNode as GraphNode);
				console.log(outputNode?.toString());
			}
		}
	}
}

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
			.get("Following")
			.map(({ following }: { following: { name: string; id: string } }) =>
				new Edge("follow").link(
					userNode,
					getUserNodeByID(userNodes, following.id) as GraphNode
				)
			)
	);
	// followEdges.forEach((followEdge) => console.log(followEdge.toString()));

	const postLikeEdges = userNodes.flatMap((userNode) =>
		userNode
			.get("PostLikes")
			.map(({ User }: { User: { id: string; name: string } }) =>
				new Edge("post-like").link(
					userNode,
					getUserNodeByID(userNodes, User.id) as GraphNode
				)
			)
	);

	BFS(userNodes[0]);
}

main();

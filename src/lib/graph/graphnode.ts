import { Unit } from "./unit";
import { Edge } from "./edge";

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

	neighbours() {
		const n = new Set<GraphNode<any>>();
		this.outputEdges.forEach(
			(edge) => edge.outputNode && n.add(edge.outputNode)
		);
		return n.values();
	}
}

export function getUserNodeByID<T extends { id: string; [key: string]: any }>(
	nodes: GraphNode<T>[],
	id: string
): GraphNode<T> | undefined {
	return nodes.find((node) => node.get("id") === id);
}

/**
 * "Get the distance from a node to another by id."
 *
 * The function takes a node and an id, and returns the sum of the weights of all edges that have the
 * given id. If the node is not connected, it will return infinity.
 * @param node - The node to get the weight for.
 * @param {string} id - The id of the node you want to get the weight for.
 * @returns The sum of the weights of all the edges that have the given id.
 */
export function getWeightForID<T extends { [key: string]: any; id: string }>(
  node: GraphNode<T>,
  id: string
): number {
  const a = node.outputEdges
    // .filter((edge) => edge.get("id") === id)
    .map((edge) => [edge.get("id"), edge.getEntity(), edge.weight]);
  return (
    node.outputEdges
      .filter((edge) => edge.get("id") === id)
      .map((edge) => edge.weight)
      .reduce((x, y) => x + y, 0) || Infinity
  );
}

/**
 * "For each node, find the shortest path to all other nodes."
 *
 * The function takes two arguments:
 * @param {GraphNode<T>[]} nodes - An array of GraphNode objects.
 * @param start - The starting node
 * @returns The shortest distance from the start node to every other node in the graph.
 */
export function dijkstra<T extends { id: string }>(
	nodes: GraphNode<T>[],
	start: GraphNode<T>
) {
	const distances: { [key: string]: number } = {};
	distances[start.get("id")] = 0;

	const queue: { id: string; weight: number }[] = [];
	for (const node of nodes) {
		if (start.get("id") !== node.get("id")) {
			distances[node.get("id")] = getWeightForID(start, node.get("id"));
		}
		queue.push({ id: node.get("id"), weight: distances[node.get("id")] });
	}

	while (queue.length > 0) {
		queue.sort((a, b) => {
			if (a.weight < b.weight) return -1;
			else if (a.weight > b.weight) return 1;
			else return 0;
		});
		const popped = queue.shift()!;
		const poppedNode = nodes.find((node) => node.get("id") === popped.id)!;

		for (const neighbour of poppedNode.neighbours()) {
			const newDistance =
				distances[popped.id] +
				getWeightForID(poppedNode, neighbour.get("id"));

			if (newDistance < distances[neighbour.get("id")]) {
				distances[neighbour.get("id")] = newDistance;
			}
		}
	}

	return distances;
}

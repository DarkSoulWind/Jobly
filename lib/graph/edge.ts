import { Unit } from "./unit";
import { GraphNode } from "./graphnode";

/* An Edge is a connection between two nodes, and it can be directed or undirected */
export class Edge<T extends { [key: string]: any }> extends Unit<T> {
	private _inputNode: GraphNode<any> | null;
	private _outputNode: GraphNode<any> | null;
	private duplex: boolean;
	private _weight: number;

	constructor(entity: string, properties: T = {} as T) {
		super(entity, properties);
		this._inputNode = null;
		this._outputNode = null;
		this.duplex = false;
		this._weight = 0;
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

	get weight() {
		return this._weight;
	}

	set weight(value: number) {
		this._weight = value;
	}

	setWeight(value: number) {
		this._weight = value;
		return this;
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

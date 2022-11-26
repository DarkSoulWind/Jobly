/* A generic class that can be used to create a node or an edge. */
export abstract class Unit<T extends { [key: string]: any } = {}> {
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

	getEntity() {
		return this.entity;
	}

	toString(): string {
		return `{"type": "${this.entity}", "properties": ${JSON.stringify(
			this.properties,
			null,
			4
		)}}`;
	}
}

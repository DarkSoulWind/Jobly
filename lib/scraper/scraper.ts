export interface JobListing {
	title: string;
	employer: string;
	link: string;
	location: string;
	description: string;
	type: string;
}

// base class, designed to be extended
export abstract class Scraper {
	protected URL: string;
	protected _results: JobListing[] = [];

	get results() {
		return this._results;
	}

	public constructor(
		public readonly keyword: string,
		public readonly location: string
	) {
		this.URL = "";
	}

	public async scrape(): Promise<void> {
		return new Promise<void>((resolve, reject) => {});
	}
}

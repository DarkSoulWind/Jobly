// Which site the data is coming from.
export type SiteType = "Reed" | "StudentJob" | "Totaljobs";

export interface JobListing {
	title: string;
	employer: string;
	link: string;
	location: string;
	description: string;
	type: SiteType;
}

export interface JobPreview {
	title: SiteType;
	salary: string;
	location: string;
	employmentType: string;
	employer: { name: string; logo: string };
	description: string;
}

// base class, designed to be extended
export abstract class Scraper {
	protected URL: string;
	protected _results: JobListing[] = [];

	public constructor(
		public readonly keyword: string,
		public readonly location: string
	) {
		this.URL = "";
	}

	get results() {
		return this._results;
	}

	public abstract scrape(): Promise<void>;
}

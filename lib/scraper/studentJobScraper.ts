import cheerio from "cheerio";
import { Scraper, JobListing } from "./scraper";

export default class StudentJobScraper extends Scraper {
	public constructor(
		public readonly keyword: string,
		public readonly location: string
	) {
		super(keyword, location);
		this.URL = `https://www.studentjob.co.uk/vacancies?region_name=&job_guide_name=&search%5Bzipcode_eq%5D=${location
			?.split(" ")
			.join("%20")}&search%5Bkeywords_scope%5D=${keyword
			?.split(" ")
			.join("+")}&sort_by=relevancy`;
	}

	public override async scrape(): Promise<void> {}
}

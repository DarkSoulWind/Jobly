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
			.join("%20")}&sort_by=relevancy`;
	}

	public override async scrape(): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			const response = await fetch(this.URL);
			if (!response.ok) reject();

			const html = await response.text();
			const $ = cheerio.load(html);
			const results: JobListing[] = [];

			// check to see if there are no results and stop if needed
			const zeroResults = $("div.job-opening-zero-results", html);
			if (zeroResults.length > 0) {
				resolve();
				return;
			}

			$("a.card__body", html).each(function (this: cheerio.Element) {
				const title = $(this).find("h3.text--bold").text().trim();
				const link = $(this).attr("href");
				const location = $(this)
					.find("span.mr-2x")
					.first()
					.text()
					.trim();
				const description = $(this)
					.find("div.flex-row.between-xs")
					.last()
					.find("div.hidden-xs")
					.last()
					.text()
					.trim();
				results.push({
					type: "StudentJob",
					employer: "urmum",
					link: "https://www.studentjob.co.uk" + link,
					title,
					location,
					description,
				});
			});

			this._results = results;

			resolve();
		});
	}
}

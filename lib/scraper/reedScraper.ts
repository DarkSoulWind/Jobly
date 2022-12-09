import axios from "axios";
import cheerio from "cheerio";
import { Scraper, JobListing, JobPreview, SiteType } from "./scraper";

// implements polymorphism
export default class ReedScraper extends Scraper {
	public constructor(
		public readonly keyword: string,
		public readonly location: string
	) {
		super(keyword, location);
		this.URL = `https://www.reed.co.uk/jobs/${keyword
			.split(" ")
			.join("-")}-jobs-in-${location.split(" ").join("-")}`;
	}

	public override async scrape(): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			console.log(`Fetching ${this.URL}...`);
			const response = await axios.get(this.URL);
			if (response.status == 500) reject();

			console.log("Fetched successfully, awaiting text response...");
			const html = await response.data;
			console.log("Parsing html...");
			const $ = cheerio.load(html);
			console.log("HTML parsed successfully");
			const results: JobListing[] = [];

			$("article.job-result-card", html).each(function (
				this: cheerio.Element
			) {
				const link = $(this).find("a").attr("href") ?? "n/a";
				const title = $(this)
					.find("h2.job-result-heading__title")
					.text()
					.trim();
				const description = $(this)
					.find("p.job-result-description__details")
					.text()
					.trim();
				const employer = $(this)
					.find("div.job-result-heading__posted-by")
					.find("a")
					.text()
					.trim();
				const location = $(this)
					.find("li.job-metadata__item.job-metadata__item--location")
					.find("span")
					.text()
					.trim();

				const result: JobListing = {
					type: "Reed",
					link: `https://reed.co.uk${link}`,
					title,
					description,
					employer,
					location,
				};
				// console.log(result);
				results.push(result);
			});

			this._results = results;

			resolve();
		});
	}

	public static async scrapePreview(link: string): Promise<JobPreview> {
		return new Promise<JobPreview>(async (resolve, reject) => {
			const response = await fetch(link);
			if (!response.ok) reject();

			const html = await response.text();
			const $ = cheerio.load(html);

			const description = $("span[itemprop='description']").text().trim();
			const salary = $("span[data-qa='salaryLbl']").text();
			const title = $("meta[itemprop='title']").attr(
				"content"
			) as SiteType;
			const employer = $("span[itemprop='name']").text();
			const employerLogo = $("meta[itemprop='logo']").attr(
				"content"
			) as string;
			const employmentType = $("span[itemprop='employmentType']")
				.text()
				.trim()
				.replaceAll(" ", "")
				.replaceAll("\n", "")
				.split(",")
				.join(", ");
			const location = $("div.location")
				.last()
				.text()
				.trim()
				.replaceAll(" ", "")
				.replaceAll("\n", "")
				.split(",")
				.join(", ");

			resolve({
				title,
				salary,
				location,
				employmentType,
				description,
				employer: { name: employer, logo: employerLogo },
			});
		});
	}
}

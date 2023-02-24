import axios from "axios";
import cheerio from "cheerio";
import { Scraper, JobListing, JobPreview, SiteType } from "./scraper";

export default class JobsiteScraper extends Scraper {
	public constructor(
		public readonly keyword: string,
		public readonly location: string,
		public readonly jobTypes: string[]
	) {
		super(keyword, location);
		console.log("SCANNING JOBSITE FOR JOBS WITH TYPE " + jobTypes);
		this.URL =
			`https://www.jobsite.co.uk/jobs/${keyword
				.split(" ")
				.join("-")}/in-${location.split(" ").join("-")}?` +
			new URLSearchParams({
				radius: "10",
				searchOrigin: "Resultlist_top-search",
			});
		console.log(
			"🚀 ~ file: jobsite.scraper.ts:14 ~ JobsiteScraper ~ this.URL",
			this.URL
		);
	}

	public override async scrape(): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			console.log("Fetching jobsite...");
			const response = await axios.get(this.URL, {
				headers: {
					"User-Agent":
						"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
				},
			});
			if (response.status != 200) reject("whoopsies");

			console.log("Fetched successfully, awaiting text response...");
			const html = response.data;
			console.log(
				"🚀 ~ file: totaljobs.scraper.ts:35 ~ TotaljobsScraper ~ returnnewPromise<void> ~ html",
				html
			);
			console.log("Parsing html...");
			const $ = cheerio.load(html);
			const results: JobListing[] = [];

			$("article.resultlist-1jx3vjx").each(function (
				this: cheerio.Element
			) {
				const link =
					$(this).find("a.resultlist-80z8zs").attr("href") ?? "n/a";
				const title = $(this).find("div.resultlist-dpthza").text();
				const description = $(this)
					.find("div.resultlist-ns7eu6 > span")
					.text()
					.trim();
				const employer = $(this)
					.find("span[data-at='job-item-company-name']")
					.text()
					.trim();
				const location = $(this)
					.find("span[data-at='job-item-location']")
					.text()
					.trim();

				const result: JobListing = {
					type: "Totaljobs",
					link: `https://www.totaljobs.com${link}`,
					title,
					description,
					employer,
					location,
				};
				console.log(
					"🚀 ~ file: totaljobs.scraper.ts:67 ~ TotaljobsScraper ~ returnnewPromise<void> ~ result",
					result
				);

				results.push(result);
			});

			this._results = results;

			resolve();
		});
	}

	public static async scrapePreview(link: string): Promise<JobPreview> {
		return new Promise<JobPreview>((resolve, reject) => {});
	}
}

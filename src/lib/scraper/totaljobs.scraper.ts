import axios from "axios";
import cheerio from "cheerio";
import { Scraper, JobListing, JobPreview, SiteType } from "./scraper";

export default class TotaljobsScraper extends Scraper {
	public constructor(
		public readonly keyword: string,
		public readonly location: string,
		public readonly jobTypes: string[]
	) {
		super(keyword, location);
		console.log("SCANNING TOTALJOBS FOR JOBS WITH TYPE " + jobTypes);
		this.URL =
			`https://www.totaljobs.com/jobs/${keyword
				.split(" ")
				.join("-")}/in-${location.split(" ").join("-")}?` +
			new URLSearchParams({ radius: "10" });
		console.log(
			"🚀 ~ file: totaljobs.scraper.ts:14 ~ TotalJobsScraper ~ URL",
			this.URL
		);
	}

	public override async scrape(): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			const response = await axios.get(this.URL, {
				headers: {
					"User-Agent":
						"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
				},
			});
			if (response.status != 200) reject("whoopsies");

			console.log("Fetched successfully, awaiting text response...");
			const html = response.data;
			// console.log(
			// 	"🚀 ~ file: totaljobs.scraper.ts:35 ~ TotaljobsScraper ~ returnnewPromise<void> ~ html",
			// 	html
			// );
			console.log("Parsing html...");
			const $ = cheerio.load(html);
			const results: JobListing[] = [];

			$("article.resultlist-1jx3vjx").each(function (
				this: cheerio.Element
			) {
				const link =
					$(this).find("a.resultlist-c2be2l").attr("href") ?? "n/a";
				const title = $(this).find("div.resultlist-ebs9d1").text();
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
				// console.log( "🚀 ~ file: totaljobs.scraper.ts:67 ~ TotaljobsScraper ~ returnnewPromise<void> ~ result", result);

				results.push(result);
			});

			this._results = results;

			resolve();
		});
	}

	public static async scrapePreview(link: string): Promise<JobPreview> {
		return new Promise<JobPreview>(async (resolve, reject) => {
			console.log(
				"🚀 ~ file: totaljobs.scraper.ts:85 ~ TotaljobsScraper ~ returnnewPromise<JobPreview> ~ link",
				link
			);
			// const response = await axios.get(link).then((response) => {
			// 	console.log(response.data);
			// 	return response;
			// });
			const controller = new AbortController();
			const id = setTimeout(() => controller.abort(), 5000);
			const response = await fetch(link, {
				signal: controller.signal,
				headers: {
					"User-Agent":
						"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
				},
			});
			clearTimeout(id);
			if (response.status !== 200) {
				console.log("not ok for totaljobs, rejecting...");
				controller.abort();
				reject();
			}

			console.log("fetched data from totaljobs");
			// const html = await response.data;
			const html = await response.text();
			const $ = cheerio.load(html);

			const description = $("div.job-description").text();
			const salary = $("li.salary > div").text();
			const title = $("h1.brand-font").text() as SiteType;
			const employerName = $("a#companyJobsLink").text();
			const employerLogo =
				"https://www.totaljobs.com" + $("img.company-logo").attr("src");
			const employmentType = $("li.job-type > div").text();
			const location = $("li.location > div").text();

			const results = {
				title,
				salary,
				location,
				employmentType,
				description,
				employer: { name: employerName, logo: employerLogo },
			};
			console.log(
				"🚀 ~ file: totaljobs.scraper.ts:100 ~ TotaljobsScraper ~ returnnewPromise<JobPreview> ~ results",
				results
			);

			resolve(results);
		});
	}
}

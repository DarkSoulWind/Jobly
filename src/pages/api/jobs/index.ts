import type { NextApiRequest, NextApiResponse } from "next";
import type { JobListing } from "src/lib/scraper";
import {
	ReedScraper,
	StudentJobScraper,
	JobsiteScraper,
	TotaljobsScraper,
} from "src/lib/scraper";

interface Results {
	keyword: string;
	location: string;
	distance: string;
	results: JobListing[];
	nextCursor?: number;
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Results>
) {
	console.log("THE QUERY IS: " + JSON.stringify(req.query));

	const {
		search = "software engineer",
		location = "london",
		distance = "10",
		cursor = "0",
		type = "",
	} = req.query as {
		search: string;
		location: string;
		distance: string;
		cursor: string;
		type: string; // needs to be converted to array
	};

	const jobTypes = type.split(",");

	try {
		const reedResults = new ReedScraper(search, location, jobTypes);
		await reedResults.scrape();
		// const studentJobResults = new StudentJobScraper(search, location);
		// await studentJobResults.scrape();
		// const jobsiteResults = new JobsiteScraper(search, location, jobTypes);
		// await jobsiteResults.scrape();
		const totaljobsResults = new TotaljobsScraper(
			search,
			location,
			jobTypes
		);
		await totaljobsResults.scrape();
		const jobResults = [
			...reedResults.results,
			...totaljobsResults.results,
		];
		// const jobResults = [...totaljobsResults.results];

		const nextCursor =
			parseInt(cursor) < jobResults.length
				? 10 + parseInt(cursor)
				: undefined;

		const results: Results = {
			keyword: search,
			location,
			distance,
			nextCursor,
			results: jobResults.slice(parseInt(cursor), 10 + parseInt(cursor)),
		};
		console.log("NEXT CURSOR", nextCursor);
		res.json(results);
	} catch (err) {
		console.log("whoopsies");
		res.status(500).end({ description: "whoopsies" });
	}
}

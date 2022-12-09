// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import type { JobListing } from "@lib/scraper";
import { ReedScraper, StudentJobScraper } from "@lib/scraper";

interface Results {
	keyword: string;
	location: string;
	results: JobListing[];
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Results>
) {
	const {
		search = "software engineer",
		location = "london",
		distance = "10",
	} = req.query as {
		search: string;
		location: string;
		distance: string;
	};

	const reedResults = new ReedScraper(search, location);
	await reedResults.scrape();
	const studentJobResults = new StudentJobScraper(search, location);
	await studentJobResults.scrape();

	const results = {
		keyword: search,
		location,
		distance,
		results: [...reedResults.results, ...studentJobResults.results],
	};
	res.json(results);
}

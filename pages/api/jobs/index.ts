// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import type { JobListing } from "../../../lib/scraper/scraper";
import ReedScraper from "../../../lib/scraper/reedScraper";
import StudentJobScraper from "../../../lib/scraper/studentJobScraper";

interface Results {
	keyword: string;
	location: string;
	results: JobListing[];
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Results>
) {
	const { search = "software engineer", location = "london" } = req.query as {
		search: string;
		location: string;
	};

	const reedResults = new ReedScraper(search, location);
	await reedResults.scrape();
	const studentJobResults = new StudentJobScraper(search, location);
	await studentJobResults.scrape();

	res.json({
		keyword: search,
		location,
		results: [...reedResults.results, ...studentJobResults.results],
	});
	// res.json({ keyword: search, location, results: studentJobResults.results });
}

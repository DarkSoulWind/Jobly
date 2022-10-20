import type { NextApiRequest, NextApiResponse } from "next";
import cheerio from "cheerio";
import { JobPreview, Scraper, SiteType } from "../../../lib/scraper/scraper";
import ReedScraper from "../../../lib/scraper/reedScraper";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "POST") {
		res.status(403).json({ message: "Please use the POST method only." });
	} else {
		const { link, type } = JSON.parse(req.body) as {
			link: string;
			type: SiteType;
		};

		switch (type) {
			case "Reed":
				const results = await ReedScraper.scrapePreview(link);
				res.json(results);
				console.log(results);
				break;
		}
	}
}

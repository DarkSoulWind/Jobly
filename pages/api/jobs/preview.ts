import type { NextApiRequest, NextApiResponse } from "next";
import { ReedScraper, SiteType } from "@lib/scraper";

interface body {
	link: string;
	type: SiteType;
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "POST") {
		res.status(403).json({ message: "Please use the POST method only." });
	} else {
		try {
			const { link, type } = JSON.parse(req.body) as body;
			const results = await getResults(type, link);
			console.log(results);
			res.json({ ...results, link, type });
		} catch (e) {
			const { link, type } = req.body as body;
			const results = await getResults(type, link);
			console.log(results);
			res.json({ ...results, link, type });
		}
	}
}

async function getResults(type: SiteType, link: string) {
	switch (type) {
		case "Reed":
			const results = await ReedScraper.scrapePreview(link);
			return results;
	}
}

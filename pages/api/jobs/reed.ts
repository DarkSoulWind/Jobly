import type { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";
import cheerio from "cheerio";

interface JobListing {
	link: string;
	title: string;
	description: string;
	employer: string;
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<any>
) {
	if (req.method !== "GET") {
		res.status(405).end();
	} else {
		const { search = "software engineer", location = "london" } =
			req.query as {
				search: string;
				location: string;
			};
		const URL = `https://www.reed.co.uk/jobs/${search
			.split(" ")
			.join("-")}-jobs-in-${location.split(" ").join("-")}`;
		console.log(`Fetching ${URL}`);

		try {
			const response = await fetch(URL);
			if (!response.ok) throw new Error(`Error fetching ${URL}`);

			console.log("Fetched stuff, parsing...");
			const html = await response.text();
			const $ = cheerio.load(html);
			const things: JobListing[] = [];

			$("article.job-result-card", html).each(function (
				this: cheerio.Element
			) {
				const link = $(this).find("a").attr("href") ?? "n/a";
				const title = $(this)
					.find("h3.job-result-heading__title")
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

				things.push({
					link: `https://reed.co.uk${link}`,
					title,
					description,
					employer,
				});
			});
			res.json({
				things,
			});
		} catch (error) {
			console.error(error);
			res.status(500).json({ error });
		}
	}
}

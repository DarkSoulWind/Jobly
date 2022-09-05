import type { NextApiRequest, NextApiResponse } from "next";
import cheerio from "cheerio";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<any>
) {
	if (req.method !== "GET") {
		res.status(405).end();
	} else {
		const { search, location } = req.query as { [key: string]: string };
		console.log(search);
		const URL = `https://www.studentjob.co.uk/vacancies?region_name=&job_guide_name=&search%5Bzipcode_eq%5D=${location
			?.split(" ")
			.join("%20")}&search%5Bkeywords_scope%5D=${search
			?.split(" ")
			.join("+")}&sort_by=relevancy`;

		try {
			const response = await fetch(URL);
			if (!response.ok) throw new Error(`Error fetching ${URL}`);

			console.log("Fetched stuff, parsing...");
			const html = await response.text();
			const $ = cheerio.load(html);
			const things: any = { results: [] };

			$("a.card__body", html).each(function (this: cheerio.Element) {
				const jobTitle = $(this).find("h3.text--bold").text().trim();
				const jobLocation = $(this)
					.find("span.mr-2x")
					.first()
					.text()
					.trim();
				const jobDescription = $(this)
					.find("div.flex-row.between-xs")
					.last()
					.find("div.hidden-xs")
					.last()
					.text()
					.trim();
				things.results.push({ jobTitle, jobLocation, jobDescription });
			});

			res.json(things);
			console.log(JSON.stringify(things, null, 4), "done searching", URL);
		} catch (error) {
			console.error(error);
			res.status(500).json({ error });
		}
	}
}

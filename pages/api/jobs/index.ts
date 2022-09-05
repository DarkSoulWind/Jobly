// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import cheerio from "cheerio";
import axios from "axios";

interface JobListing {
	jobTitle: string;
	jobLocation: string;
	jobDescription: string[];
}

type Data = {
	results: JobListing[];
};

export default function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	const search = (req.query.search as string) || "software engineer";
	const URL = `https://uk.indeed.com/jobs?q=${search.split(" ").join("+")}`;
	console.log(URL);

	axios.get(URL).then((response) => {
		const html = response.data;
		const $ = cheerio.load(html);
		const things: Data = { results: [] };

		$(".slider_item", html).each(function (this: cheerio.Element) {
			const jobTitle = $(this).find(".jcs-JobTitle").text().trim();
			const jobLocation = $(this).find(".company_location").text().trim();
			const jobSnippetEl = $(this).find(".job-snippet").find("ul");
			let jobDescription: any[] = [];
			$(jobSnippetEl)
				.children()
				.each(function (this: cheerio.Element) {
					jobDescription.push($(this).text().trim());
				});
			things.results.push({ jobTitle, jobLocation, jobDescription });
		});
		res.json(things);
	});
}

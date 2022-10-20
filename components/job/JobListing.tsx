import React, { DetailedHTMLProps, FC, HTMLAttributes } from "react";
import { JobListing } from "../../lib/scraper/scraper";

interface JobListingProps
	extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	job: JobListing;
}

const JobListing: FC<JobListingProps> = ({ job, onClick, key }) => {
	return (
		<article
			onClick={onClick}
			key={key}
			className="p-5 border-[1px] cursor-pointer hover:border-blue-500 border-slate-300 bg-white w-full rounded-lg"
		>
			<header className="font-bold text-xl">{job.title}</header>
			<p className="text-blue-600 font-medium">{job.location}</p>
			<p className="text-sm">{job.description}</p>
		</article>
	);
};

export default JobListing;

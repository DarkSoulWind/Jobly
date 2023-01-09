import React, { DetailedHTMLProps, FC, HTMLAttributes } from "react";
import { FaLocationArrow } from "react-icons/fa";
import type { JobListing } from "@lib/scraper/scraper";

interface JobListingProps
	extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	job: JobListing;
	selected: boolean;
}

const JobListingComponent: FC<JobListingProps> = ({
	job,
	onClick,
	key,
	selected,
}) => {
	return (
		<article
			onClick={onClick}
			key={key}
			className={`p-5 cursor-pointer hover:border-blue-500 bg-white w-full rounded-lg ${
				selected
					? "border-blue-500 border-2"
					: "border-slate-300 border-[1px]"
			}`}
		>
			<header className="">
				<span className="font-bold text-xl">{job.title}</span>{" "}
				<span className="text-blue-600 font-medium">
					{job.employer}
				</span>
			</header>

			<div className="mt-1 inline-flex items-center gap-2 text-xs bg-slate-200 font-bold p-1 rounded-sm">
				<FaLocationArrow />
				<p>{job.location}</p>
			</div>

			<section className="mt-2">
				<p className="text-sm">{job.description}</p>
			</section>
		</article>
	);
};

export default JobListingComponent;

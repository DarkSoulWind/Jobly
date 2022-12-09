import React, {
	FC,
	lazy,
	DetailedHTMLProps,
	HTMLAttributes,
	Suspense,
	Dispatch,
	SetStateAction,
} from "react";
import LoadingJobListing from "@components/job/SkeletonLoadingJob";
import { JobListing } from "@lib/scraper";

const JobListingComponent = lazy(() =>
	import("@components/job/JobListing").then((module) => ({
		default: module.default,
	}))
);

interface JobResultsProps
	extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
	isFetchingJobData: boolean;
	isErrorJobData: boolean;
	isLoadingErrorJobData: boolean;
	isRefetchErrorJobData: boolean;
	jobData:
		| {
				keyword: string;
				location: string;
				distance: string;
				results: JobListing[];
		  }
		| undefined;
	selectedJob: {
		job: {
			index: number | null;
			link: string;
			type: string;
		};
		setSelectedJob: Dispatch<
			SetStateAction<{
				index: number | null;
				link: string;
				type: string;
			}>
		>;
	};
}

const JobResults: FC<JobResultsProps> = ({
	jobData,
	selectedJob,
	isFetchingJobData,
	isErrorJobData,
	isLoadingErrorJobData,
	isRefetchErrorJobData,
}) => {
	if (isFetchingJobData)
		return (
			<section className="flex flex-col w-full h-full items-start justify-start gap-5">
				{[1, 2, 3, 4, 5].map(() => (
					<LoadingJobListing />
				))}
			</section>
		);

	if (
		isErrorJobData ||
		isLoadingErrorJobData ||
		isRefetchErrorJobData ||
		!jobData
	)
		return (
			<section className="text-center h-full w-full text-black">
				<p className="text-4xl font-bold">Error fetching jobs</p>
			</section>
		);

	if (jobData.results.length === 0)
		return (
			<section className="text-center h-full w-full  text-black">
				<p className="text-4xl font-bold">No jobs available</p>
			</section>
		);

	return (
		<>
			{/* JOB RESULTS */}
			<main className="w-full h-full">
				{/* // ALL JOB LISTINGS */}
				<section className="w-full flex flex-col items-start gap-5">
					{jobData.results.map((job, index) => {
						return (
							<Suspense fallback={<LoadingJobListing />}>
								<JobListingComponent
									onClick={() => {
										selectedJob.setSelectedJob({
											index,
											link: job.link,
											type: job.type,
										});
									}}
									selected={selectedJob.job.index === index}
									key={index}
									job={job}
								/>
							</Suspense>
						);
					})}
				</section>
			</main>
		</>
	);
};

export default JobResults;

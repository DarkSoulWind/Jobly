import React, {
	FC,
	lazy,
	DetailedHTMLProps,
	HTMLAttributes,
	Suspense,
	Dispatch,
	SetStateAction,
	useEffect,
} from "react";
import LoadingJobListing from "@components/job/SkeletonLoadingJob";
import { JobListing } from "@lib/scraper";
import {
	FetchNextPageOptions,
	InfiniteData,
	InfiniteQueryObserverResult,
} from "react-query";
import { useInView } from "react-intersection-observer";

const JobListingComponent = lazy(() =>
	import("@components/job/JobListing").then((module) => ({
		default: module.default,
	}))
);

interface JobResultsProps
	extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
	isFetchingJobData: boolean;
	isFetchingNextPage: boolean;
	isErrorJobData: boolean;
	isLoadingErrorJobData: boolean;
	isRefetchErrorJobData: boolean;
	hasNextPage?: boolean;
	fetchNextPage: (options?: FetchNextPageOptions | undefined) => Promise<
		InfiniteQueryObserverResult<
			{
				keyword: string;
				location: string;
				distance: string;
				results: JobListing[];
				nextCursor: number;
			},
			unknown
		>
	>;
	jobData:
		| InfiniteData<{
				keyword: string;
				location: string;
				distance: string;
				results: JobListing[];
				nextCursor: number;
		  }>
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
	fetchNextPage,
	isFetchingJobData,
	isFetchingNextPage,
	isErrorJobData,
	isLoadingErrorJobData,
	isRefetchErrorJobData,
	hasNextPage,
}) => {
	const { ref: loadMoreRef, inView } = useInView({ threshold: 0 });

	useEffect(() => {
		if (inView) {
			console.log("at the bottom, loading more");
			fetchNextPage();
		}
	}, [inView]);

	if (isErrorJobData || isLoadingErrorJobData || isRefetchErrorJobData)
		return (
			<section className="text-center h-full w-full text-black">
				<p className="text-4xl font-bold">Error fetching jobs</p>
			</section>
		);

	if (jobData?.pages.flatMap((page) => page.results).length === 0)
		return (
			<section className="text-center h-full w-full  text-black">
				<p className="text-4xl font-bold">No jobs available</p>
			</section>
		);

	if (isFetchingJobData && !isFetchingNextPage) {
		return (
			<section className="flex flex-col w-full h-full items-start justify-start gap-5">
				{new Array(10).fill(1).map((a, i) => (
					<LoadingJobListing key={i} />
				))}
			</section>
		);
	}

	return (
		<>
			{/* JOB RESULTS */}
			<main className="w-full h-full">
				{/* // ALL JOB LISTINGS */}
				<section className="w-full flex flex-col items-start gap-5">
					{jobData?.pages
						.flatMap((page) => page.results)
						.map((job, index) => {
							return (
								<Suspense
									key={index}
									fallback={<LoadingJobListing />}
								>
									<JobListingComponent
										onClick={() => {
											selectedJob.setSelectedJob({
												index,
												link: job.link,
												type: job.type,
											});
										}}
										selected={
											selectedJob.job.index === index
										}
										job={job}
									/>
								</Suspense>
							);
						})}
				</section>

				{isFetchingNextPage && (
					<section className="flex py-5 flex-col w-full h-full items-start justify-start gap-5">
						{new Array(10).fill(1).map((a, i) => (
							<LoadingJobListing key={i} />
						))}
					</section>
				)}

				{/* LOADS MORE WHEN IN VIEW */}
				{hasNextPage && !isFetchingNextPage && (
					<div
						ref={loadMoreRef}
						className="w-full flex justify-center py-5"
					></div>
				)}
			</main>
		</>
	);
};

export default JobResults;

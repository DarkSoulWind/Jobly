"JOB SEARCH PAGE";
"TODO: make selected job preview load after job listings";

import { useState, FormEvent, useReducer, lazy, Suspense } from "react";
import type {
	NextPage,
	InferGetServerSidePropsType,
	GetServerSideProps,
} from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import type { JobListing } from "@lib/scraper/scraper";
import type { SavedJob } from "@prisma/client";
import {
	JobSearchReducer,
	JobSearchState,
	JOB_SEARCH_ACTION,
} from "@lib/reducers/jobReducer";

// COMPONENTS
import Navbar from "@components/nav/Navbar";
import Footer from "@components/footer/Footer";
import SkeletonLoadingJobPreview from "@components/job/SkeletonLoadingJobPreview";
import JobDistanceFilters from "@components/listbox/JobDistanceFilters";
import JobResults from "@components/job/JobResults";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient, useInfiniteQuery } from "react-query";
import { FaLocationArrow, FaSearch } from "react-icons/fa";
import axios, { AxiosResponse } from "axios";

const SelectedPreview = lazy(() =>
	import("@components/job/SelectedPreview").then((module) => ({
		default: module.default,
	}))
);

const initialState: JobSearchState = {
	searchInput: "",
	locationInput: "",
	jobResults: [],
	loading: false,
};

const initState = (
	state: JobSearchState,
	jobResults: JobListing[],
	{
		searchInput,
		locationInput,
	}: { searchInput: string; locationInput: string }
): JobSearchState => {
	return { ...state, jobResults, searchInput, locationInput };
};

// FILTER OPTIONS
type JobType =
	| "Part time"
	| "Full time"
	| "Voluntary"
	| "Work from home"
	| "Internship"
	| "Weekend";
const jobTypes: JobType[] = [
	"Part time",
	"Full time",
	"Voluntary",
	"Work from home",
	"Internship",
	"Weekend",
];

const distanceTypes = [10, 25, 50, 100];

const Jobs: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = (
	props
) => {
	const queryClient = useQueryClient();
	const router = useRouter();
	const { data: sessionData } = useSession();
	const [jobSearchState, dispatch] = useReducer(
		JobSearchReducer,
		initialState,
		(state) =>
			initState(state, props.jobResults.results, {
				searchInput: router.query.search as string,
				locationInput: router.query.location as string,
			})
	);
	const [selectedJob, setSelectedJob] = useState({
		index: props.jobResults?.results ? 0 : null,
		link: props.jobResults?.results
			? props.jobResults?.results[0]?.link
			: "",
		type: props.jobResults?.results
			? props.jobResults?.results[0]?.type
			: "",
	});
	const [distance, setDistance] = useState(
		props.jobResults?.distance ?? router.query.distance ?? 10
	);
	const [selectedJobTypes, setSelectedJobTypes] = useState<JobType[]>(
		router.query.type as JobType[]
	);
	const [selectedJobTypesChecked, setSelectedJobTypesChecked] = useState<
		boolean[]
	>(
		jobTypes.map((jobType) =>
			(router.query.type as JobType[])?.includes(jobType)
		)
	);

	const fetchJobs = ({ pageParam = 0 }) => {
		return getJobs(
			jobSearchState.searchInput,
			jobSearchState.locationInput,
			distance.toString(),
			selectedJobTypes,
			pageParam
		);
	};

	const {
		data: jobData,
		isFetching: isFetchingJobData,
		isFetchingNextPage,
		isError: isErrorJobData,
		isLoadingError: isLoadingErrorJobData,
		isRefetchError: isRefetchErrorJobData,
		refetch: refetchJobs,
		fetchNextPage,
		hasNextPage,
	} = useInfiniteQuery(["job-data", distance], fetchJobs, {
		getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
		enabled: true,
		refetchOnWindowFocus: false,
		retry: 3,
		initialData: () => {
			return {
				pageParams: [undefined],
				pages: [props.jobResults],
			};
		},
	});

	/**
	 * It fetches the saved jobs from the database and returns them as an array of SavedJob objects
	 * @returns An array of SavedJob objects.
	 */
	const getSavedJobs = async () => {
		const response = await fetch(
			`http://localhost:3000/api/jobs/save/${sessionData?.user?.email}`
		);
		const data: SavedJob[] = await response.json();
		return data;
	};

	const { data: savedJobData } = useQuery("saved-jobs", getSavedJobs);

	/**
	 * It takes the search and location inputs from the state, and then uses them to fetch the job listings
	 * from the API
	 * @param event - FormEvent<HTMLFormElement>
	 */
	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const query = {
			location: jobSearchState.locationInput,
			distance: distance.toString(),
			type: selectedJobTypes,
		};
		router.push(
			{
				pathname: `/jobs/search/${jobSearchState.searchInput}`,
				query,
			},
			undefined,
			{ shallow: true }
		);
		refetchJobs({ queryKey: ["job-data", distance] });
		queryClient.invalidateQueries("job-preview");
	};

	/**
	 * When the user clicks on a checkbox, update the state of the checkboxes, and then update the URL with
	 * the new state.
	 * @param {number} index - number - the index of the job type that was clicked
	 */
	const handleJobTypeChange = (index: number) => {
		const updatedState = selectedJobTypesChecked.map((b, i) =>
			i === index ? !b : b
		);
		setSelectedJobTypesChecked(updatedState);

		const updatedJobTypes = updatedState
			.map((val, i) => ({ type: jobTypes[i], checked: val }))
			.filter((val) => val.checked)
			.map((val) => val.type);
		setSelectedJobTypes(updatedJobTypes);

		router.push({
			pathname: `/jobs/search/${jobSearchState.searchInput}`,
			query: {
				location: jobSearchState.locationInput,
				type: updatedJobTypes,
				distance,
			},
		});
	};

	return (
		<>
			<Head>
				<title>
					{props.jobResults.keyword.trim().length > 0
						? `Search for: ${props.jobResults.keyword}`
						: "Find a job"}
				</title>
				<meta
					name="description"
					content={
						props.jobResults.keyword.trim().length > 0
							? `Job search results for ${props.jobResults.keyword} on Jobly.`
							: "Find a job."
					}
				/>
			</Head>

			<div className="background"></div>

			<Navbar />

			<div className="p-2 flex flex-col items-center">
				{/* JOB SEARCH */}
				<form
					onSubmit={handleSubmit}
					className="flex justify-center border-[1px] border-slate-300 bg-white py-3 px-4 rounded-xl sticky items-center flex-wrap mt-[4.5rem] gap-3"
				>
					{/* SEARCH WHAT JOB */}
					<div className="flex justify-start items-center gap-3 py-2 px-5 bg-slate-200/70 rounded-full">
						<FaSearch className="fill-slate-500" />

						<label className="font-semibold">What</label>

						<input
							type="text"
							className="outline-none font-light text-sm text-black placeholder:text-slate-500 bg-transparent"
							placeholder="Job title, etc"
							value={jobSearchState.searchInput}
							onChange={(e) =>
								dispatch({
									type: JOB_SEARCH_ACTION.SET_SEARCH_INPUTS,
									payload: { searchInput: e.target.value },
								})
							}
						/>
					</div>

					{/* SEARCH WHERE JOB */}
					<div className="flex justify-start items-center gap-3 py-2 px-5 bg-slate-200/70 rounded-full">
						<FaLocationArrow className="fill-slate-500" />

						<label className="font-semibold">Where</label>

						<input
							type="text"
							className="outline-none font-light text-sm text-black placeholder:text-slate-500 bg-transparent"
							placeholder="London, England, etc"
							value={jobSearchState.locationInput}
							onChange={(e) =>
								dispatch({
									type: JOB_SEARCH_ACTION.SET_SEARCH_INPUTS,
									payload: { locationInput: e.target.value },
								})
							}
						/>
					</div>

					<input
						type="submit"
						className="py-2 px-4 cursor-pointer bg-blue-700 hover:bg-blue-900 text-white disabled:bg-blue-900 disabled:cursor-wait ease-in-out transition-all font-semibold rounded-full"
						disabled={isFetchingJobData}
						value="Find job"
					/>
				</form>

				<div className="w-full text-2xl flex justify-center py-5">
					<h4>
						{isFetchingJobData || isFetchingNextPage || !jobData ? (
							<span className="animate-pulse">
								Searching jobs...
							</span>
						) : (
							// number of jobs present
							jobData.pages.flatMap((page) => page.results)
								.length > 0 && (
								<>
									Showing{" "}
									<strong>
										{
											jobData!.pages.flatMap(
												(page) => page.results
											).length
										}
									</strong>{" "}
									results for{" "}
									<span className="font-bold bg-gradient-to-r from-fuchsia-800 to-rose-500 bg-clip-text text-transparent">
										{
											jobData?.pages[
												jobData.pages.length - 1
											].keyword
										}
									</span>
								</>
							)
						)}
					</h4>
				</div>

				<div className="w-4/5 relative px-6 flex justify-center items-start gap-5">
					{/* FILTERS */}
					<aside className="px-5 sticky top-[5rem] border-[1px] hidden md:flex flex-col divide-y-2 border-slate-300 bg-white rounded-lg">
						{/* DISTANCE FILTERS */}
						<JobDistanceFilters
							distance={distance}
							setDistance={setDistance}
							distanceTypes={distanceTypes}
							jobSearchState={jobSearchState}
						/>

						{/* JOB TYPE FILTERS */}
						<div className="w-[15rem] py-5 flex flex-col items-start gap-3">
							<p className="font-bold">Type</p>
							{jobTypes.map((jobType, index) => (
								<div
									key={jobType}
									className="w-full flex justify-start gap-4 items-center"
								>
									<input
										type="checkbox"
										name={jobType}
										value={jobType
											.toLowerCase()
											.split(" ")
											.join("-")}
										checked={selectedJobTypesChecked[index]}
										onChange={() =>
											handleJobTypeChange(index)
										}
										className="w-5 h-5"
									/>
									<label>{jobType}</label>
								</div>
							))}
						</div>
					</aside>

					<JobResults
						isFetchingJobData={isFetchingJobData}
						isFetchingNextPage={isFetchingNextPage}
						isErrorJobData={isErrorJobData}
						isLoadingErrorJobData={isLoadingErrorJobData}
						isRefetchErrorJobData={isRefetchErrorJobData}
						hasNextPage={hasNextPage}
						jobData={jobData}
						fetchNextPage={fetchNextPage}
						selectedJob={{
							job: selectedJob,
							setSelectedJob,
						}}
					/>

					{selectedJob && (
						<Suspense fallback={<SkeletonLoadingJobPreview />}>
							<SelectedPreview
								link={selectedJob.link}
								type={selectedJob.type}
								isSaved={
									!!savedJobData?.find(
										(savedJob) =>
											savedJob.link === selectedJob.link
									)
								}
								isErrorJobData={
									isErrorJobData ||
									jobData?.pages[jobData?.pages.length - 1]
										.results.length === 0
								}
								router={router}
								jobData={jobData}
							/>
						</Suspense>
					)}
				</div>
			</div>

			<Footer />
		</>
	);
};

// Type of object we get back from the api
type JobsAPIResponse = {
	keyword: string;
	location: string;
	distance: string;
	results: JobListing[];
	nextCursor: number;
};

async function getJobs(
	search: string,
	location: string,
	distance: string,
	jobTypes: JobType[],
	cursor: number = 0
) {
	const url =
		"http://localhost:3000/api/jobs?" +
		new URLSearchParams({
			search,
			location,
			distance,
			type: jobTypes.toString(),
			cursor: cursor.toString(),
		});

	const response = await axios.get<
		any,
		AxiosResponse<JobsAPIResponse, Error>
	>(url);

	if (response.status === 500) {
		throw new Error("whoopsies");
	}

	const responseData = await response.data;

	console.log(
		"Current cursor",
		cursor,
		"next cursor",
		responseData.nextCursor
	);
	return responseData;
}

// SERVER SIDE RENDER PAGE BASED ON SEARCH AND LOCATION QUERY
export const getServerSideProps: GetServerSideProps<
	{ jobResults: JobsAPIResponse },
	{ search: string }
> = async (context) => {
	console.log("PARAMS", context.params);

	const search = context.params?.search!;
	const location = (context.query.location as string) ?? "";
	const jobTypes = (context.query.type as JobType[]) ?? [];
	let distance = parseInt((context.query.distance as string) ?? "10") ?? 10;
	if (isNaN(distance)) distance = 10;

	// if search is empty do not server side render
	if (search === "")
		return {
			props: {
				jobResults: {
					keyword: "",
					location: "",
					distance: "",
					nextCursor: 0,
					results: [] as JobListing[],
				},
			},
		};

	const jobResults = await getJobs(
		search,
		location,
		distance.toString(),
		jobTypes
	);

	return { props: { jobResults } };
};

export default Jobs;

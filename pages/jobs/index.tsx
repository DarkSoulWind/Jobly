"JOB SEARCH PAGE";

import {
	useState,
	FormEvent,
	useReducer,
	lazy,
	Suspense,
	Fragment,
	useCallback,
	ChangeEvent,
} from "react";
import type {
	NextPage,
	GetServerSidePropsContext,
	InferGetServerSidePropsType,
} from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import {
	JobSearchReducer,
	JobSearchState,
	JOB_SEARCH_ACTION,
} from "@reducers/jobReducer";
import type { JobListing } from "@lib/scraper/scraper";
import type { SavedJob } from "@prisma/client";

// COMPONENTS
import Navbar from "@components/nav/Navbar";
import Footer from "@components/footer/Footer";
import SkeletonLoadingJobPreview from "@components/job/SkeletonLoadingJobPreview";
import JobDistanceFilters from "@components/listbox/JobDistanceFilters";
import JobResults from "@components/job/JobResults";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "react-query";
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

const popularSearches = [
	"Supermarket",
	"Healthcare",
	"Call Centre",
	"Delivery Driver",
	"Customer Service",
	"Work From Home",
	"Temporary",
	"Full Time",
	"Warehouse",
	"Care Assistant",
];

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
	const [selectedJobTypes, setSelectedJobTypes] = useState<JobType[]>([]);
	const [selectedJobTypesChecked, setSelectedJobTypesChecked] = useState(
		new Array(jobTypes.length).fill(false)
	);
	const fetchJobs = useCallback(() => {
		return getJobs(
			jobSearchState.searchInput,
			jobSearchState.locationInput,
			distance.toString()
		);
	}, [jobSearchState.searchInput, jobSearchState.locationInput, distance]);

	const {
		data: jobData,
		isFetching: isFetchingJobData,
		isError: isErrorJobData,
		isLoadingError: isLoadingErrorJobData,
		isRefetchError: isRefetchErrorJobData,
		refetch: refetchJobs,
	} = useQuery(["job-data", distance], fetchJobs, {
		initialData: props.jobResults,
		enabled: true,
		refetchOnWindowFocus: false,
		retry: 3,
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
			search: jobSearchState.searchInput,
			location: jobSearchState.locationInput,
			distance: distance.toString(),
			type: selectedJobTypes,
		};
		refetchJobs();
		router.push(
			{
				pathname: "/jobs",
				query,
			},
			undefined,
			{ shallow: true }
		);
		queryClient.invalidateQueries("job-preview");
	};

	const handleJobTypeChange = (index: number) => {
		const updatedState = selectedJobTypesChecked.map((b, i) =>
			i === index ? !b : b
		);

		setSelectedJobTypesChecked(updatedState);
		const d = updatedState.reduce((acc, val, i) => {
			if (val === true) {
				return [...acc, jobTypes[i]];
			}
			return acc;
		}, []);
		setSelectedJobTypes(d);
		router.push({
			pathname: "/jobs",
			query: {
				search: jobSearchState.searchInput,
				location: jobSearchState.locationInput,
				distance,
				type: d,
			},
		});
	};

	return (
		<>
			<Head>
				<title>
					{props.search.trim().length > 0
						? `Search for: ${props.search}`
						: "Find a job"}
				</title>
				<meta
					name="description"
					content={
						props.search.trim().length > 0
							? `Job search results for ${props.search} on Jobly.`
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

				{/* ONLY SHOW THIS SECTION IF ON "/jobs" (no search has been made) */}
				{router.query.search ? (
					<div className="w-4/5 relative px-6 py-5 flex justify-center items-start gap-5">
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
											checked={
												selectedJobTypesChecked[index]
											}
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
							isErrorJobData={isErrorJobData}
							isLoadingErrorJobData={isLoadingErrorJobData}
							isRefetchErrorJobData={isRefetchErrorJobData}
							jobData={jobData}
							selectedJob={{ job: selectedJob, setSelectedJob }}
						/>

						{selectedJob && (
							<Suspense fallback={<SkeletonLoadingJobPreview />}>
								<SelectedPreview
									link={selectedJob.link}
									type={selectedJob.type}
									isSaved={
										!!savedJobData?.find(
											(savedJob) =>
												savedJob.link ===
												selectedJob.link
										)
									}
									router={router}
								/>
							</Suspense>
						)}
					</div>
				) : (
					// SHOW POPULAR SEARCHES IF SEARCH ISNT SPECIFIED
					<div className="py-10 text-center space-y-4 max-w-[50rem]">
						<p className="font-semibold text-lg">
							Popular searches
						</p>

						<div className="flex flex-wrap gap-3 items-center justify-center">
							{popularSearches.map((job, index) => (
								<button
									key={index}
									className="p-2 flex items-center gap-3 bg-gray-300 hover:bg-gray-400/60 transition-all rounded-lg text-sm font-light"
									onClick={() => {
										dispatch({
											type: JOB_SEARCH_ACTION.SET_SEARCH_INPUTS,
											payload: { searchInput: job },
										});
										router.push({
											pathname: "/jobs",
											query: {
												search: job,
												location:
													jobSearchState.locationInput,
												distance: 10,
												type: selectedJobTypes,
											},
										});
									}}
								>
									<FaSearch className="fill-slate-600" />

									<p>{job}</p>
								</button>
							))}
						</div>
					</div>
				)}
			</div>

			<Footer />
		</>
	);
};

async function getJobs(search: string, location: string, distance: string) {
	const url =
		"http://localhost:3000/api/jobs?" +
		new URLSearchParams({
			search,
			location,
			distance,
		});

	// Type of object we get back from the api
	type ResponseObject = {
		keyword: string;
		location: string;
		distance: string;
		results: JobListing[];
	};
	const response = await axios.get<any, AxiosResponse<ResponseObject, Error>>(
		url
	);
	const responseData = await response.data;

	console.log("Fetched jobs", responseData);
	return responseData;
}

// SERVER SIDE RENDER PAGE BASED ON SEARCH AND LOCATION QUERY
export async function getServerSideProps(context: GetServerSidePropsContext) {
	const search = (context.query.search as string) ?? "";
	const location = (context.query.location as string) ?? "";
	let distance = parseInt(context.query.distance as string) ?? 10;
	if (isNaN(distance)) distance = 10;

	// if search is empty do not server side render
	if (search === "")
		return {
			props: {
				search,
				jobResults: {
					keyword: "",
					location: "",
					distance: "",
					results: [] as JobListing[],
				},
			},
		};

	const jobResults: {
		keyword: string;
		location: string;
		distance: string;
		results: JobListing[];
	} = await getJobs(
		search.split(" ").join("%20"),
		location.split(" ").join("%20"),
		distance.toString()
	);

	return { props: { search, jobResults } };
}

export default Jobs;

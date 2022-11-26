"JOB SEARCH PAGE";

import {
	useState,
	FormEvent,
	useReducer,
	lazy,
	Suspense,
	Fragment,
} from "react";
import type {
	NextPage,
	GetServerSidePropsContext,
	InferGetServerSidePropsType,
} from "next";
import {
	JobSearchReducer,
	JobSearchState,
	JOB_SEARCH_ACTION,
} from "@reducers/jobReducer";
import { useRouter } from "next/router";
import { FaLocationArrow, FaSearch } from "react-icons/fa";
import Head from "next/head";
import Navbar from "@components/nav/Navbar";
import Footer from "@components/footer/Footer";
import LoadingJobListing from "@components/job/SkeletonLoadingJob";
import type { JobListing } from "@lib/scraper/scraper";
import { useSession } from "next-auth/react";
import type { SavedJob } from "@prisma/client";
import { useQuery } from "react-query";
import SkeletonLoadingJobPreview from "@components/job/SkeletonLoadingJobPreview";
import { Listbox, Transition } from "@headlessui/react";
import { HiCheckCircle, HiChevronDown } from "react-icons/hi";
import { URLSearchParams } from "url";

const JobListingComponent = lazy(() =>
	import("@components/job/JobListing").then((module) => ({
		default: module.default,
	}))
);

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

const Jobs: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = (
	props
) => {
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
		index: props.jobResults.results ? 0 : null,
		link: props.jobResults.results
			? props.jobResults?.results[0]?.link
			: "",
		type: props.jobResults.results
			? props.jobResults?.results[0]?.type
			: "",
	});
	const [distance, setDistance] = useState(10);

	// FILTER OPTIONS
	const jobTypes = [
		"Part time",
		"Full time",
		"Voluntary",
		"Work from home",
		"Internship",
		"Weekend",
	];
	const distanceTypes = [10, 25, 50, 100];

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
		};

		dispatch({
			type: JOB_SEARCH_ACTION.SET_LOADING,
			payload: { loading: true },
		});

		try {
			router.push(
				{
					pathname: "/jobs",
					query,
				},
				undefined,
				{ shallow: true }
			);
			const response = await fetch(
				`http://localhost:3000/api/jobs?search=${jobSearchState.searchInput
					.split(" ")
					.join("%20")}&location=${jobSearchState.locationInput
					.split(" ")
					.join("%20")}`
			);
			const data: { results: JobListing[] } = await response.json();

			if (!response.ok) throw new Error(JSON.stringify(data, null, 4));

			console.log(JSON.stringify(data, null, 4));
			dispatch({
				type: JOB_SEARCH_ACTION.SET_JOB_RESULTS,
				payload: { jobResults: data.results },
			});
			setSelectedJob({
				index: 0,
				link: data.results[0].link,
				type: data.results[0].type,
			});
		} catch (error) {
			console.error(error);
		}

		dispatch({
			type: JOB_SEARCH_ACTION.SET_LOADING,
			payload: { loading: false },
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
						disabled={jobSearchState.loading}
						value="Find job"
					/>
				</form>

				{router.query.search ? (
					<div className="w-4/5 relative px-6 py-5 flex justify-center items-start gap-5">
						{/* FILTERS */}
						<aside className="px-5 sticky top-[5rem] border-[1px] hidden md:flex flex-col divide-y-2 border-slate-300 bg-white rounded-lg">
							{/* DISTANCE FILTERS */}
							<Listbox value={distance} onChange={setDistance}>
								<div className="py-5 relative">
									<Listbox.Label className="font-bold">
										Distance
									</Listbox.Label>
									<Listbox.Button className="relative w-full cursor-pointer transition-all rounded-lg bg-white hover:bg-slate-50 py-3 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
										<span className="block truncate">
											Within {distance}km
										</span>
										<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
											<HiChevronDown
												className="h-5 w-5 text-gray-400"
												aria-hidden="true"
											/>
										</span>
									</Listbox.Button>
									<Transition
										as={Fragment}
										leave="transition ease-in duration-100"
										leaveFrom="opacity-100"
										leaveTo="opacity-0"
									>
										<Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
											{distanceTypes.map(
												(value, index) => (
													<Listbox.Option
														key={index}
														className={({
															active,
														}) =>
															`relative cursor-pointer select-none py-2 pl-10 pr-4 transition-all duration-300 ${
																active
																	? "bg-amber-100 text-amber-900"
																	: "text-gray-900"
															}`
														}
														value={value}
													>
														{({ selected }) => (
															<>
																<span
																	className={`block truncate ${
																		selected
																			? "font-medium"
																			: "font-normal"
																	}`}
																>
																	{value}
																</span>
																{selected ? (
																	<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
																		<HiCheckCircle
																			className="h-5 w-5"
																			aria-hidden="true"
																		/>
																	</span>
																) : null}
															</>
														)}
													</Listbox.Option>
												)
											)}
										</Listbox.Options>
									</Transition>
								</div>
							</Listbox>

							{/* JOB TYPE FILTERS */}
							<div className="w-[15rem] py-5 flex flex-col items-start gap-3">
								<p className="font-bold">Type</p>
								{jobTypes.map((jobType) => (
									<div
										key={jobType}
										className="w-full flex justify-start gap-4 items-center"
									>
										<input
											type="checkbox"
											name={jobType}
											value={jobType}
											className="w-5 h-5"
										/>
										<label>{jobType}</label>
									</div>
								))}
							</div>
						</aside>

						{/* JOB RESULTS */}
						<main className="w-full h-full">
							{jobSearchState.jobResults &&
							jobSearchState.jobResults.length > 0 ? (
								<>
									{
										// SHOW SKELETON JOB RESULTS WHEN LOADING
										jobSearchState.loading ? (
											<section className="flex flex-col items-start justify-start gap-5">
												{[1, 2, 3, 4, 5].map(() => (
													<LoadingJobListing />
												))}
											</section>
										) : (
											// ALL JOB LISTINGS
											<section className="w-full flex flex-col items-start gap-5">
												{jobSearchState.jobResults.map(
													(job, index) => {
														return (
															<Suspense
																fallback={
																	<LoadingJobListing />
																}
															>
																<JobListingComponent
																	onClick={() => {
																		setSelectedJob(
																			{
																				index,
																				link: job.link,
																				type: job.type,
																			}
																		);
																	}}
																	selected={
																		selectedJob.index ===
																		index
																	}
																	key={index}
																	job={job}
																/>
															</Suspense>
														);
													}
												)}
											</section>
										)
									}
								</>
							) : (
								<section className="text-center h-full  text-black">
									<p className="text-4xl font-bold">
										No jobs available
									</p>
								</section>
							)}
						</main>

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
							{[
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
							].map((job, index) => (
								<button
									className="p-2 flex items-center gap-3 bg-gray-300 hover:bg-gray-400/60 transition-all rounded-lg text-sm font-light"
									onClick={() => {
										dispatch({
											type: JOB_SEARCH_ACTION.SET_SEARCH_INPUTS,
											payload: { searchInput: job },
										});
										// router.push({
										// 	pathname: "/jobs",
										// 	query: {
										// 		search: job,
										// 		location: "",
										// 	},
										// });
										router.push(
											`/jobs?search=${job}&location=`
										);
									}}
									key={index}
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

// SERVER SIDE RENDER PAGE BASED ON SEARCH AND LOCATION QUERY
export async function getServerSideProps(context: GetServerSidePropsContext) {
	const search = (context.query.search as string) ?? "";
	const location = (context.query.location as string) ?? "";

	// if search is empty do not server side render
	if (search === "")
		return {
			props: {
				search,
				jobResults: { keyword: null, location: null, results: [] },
			},
		};

	const url =
		"http://localhost:3000/api/jobs?" +
		new URLSearchParams({
			search: search.split(" ").join("%20"),
			location: location.split(" ").join("%20"),
		});

	const response = await fetch(url);
	const jobResults: {
		keyword: string;
		location: string;
		results: JobListing[];
	} = await response.json();

	return { props: { search, jobResults } };
}

export default Jobs;

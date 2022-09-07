import type { NextPage, GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useState, FormEvent, useReducer, useEffect } from "react";
import { FaLocationArrow, FaSearch } from "react-icons/fa";
import Head from "next/head";
import Navbar from "../../components/nav/Navbar";
import Footer from "../../components/footer/Footer";
import LoadingJobListing from "../../components/job/SkeletonLoadingJob";

interface JobListing {
	jobTitle: string;
	jobLocation: string;
	jobDescription: string;
}

type JobsProps = {
	search: string;
	jobResults: {
		results: JobListing[];
	};
};
interface JobSearchState {
	searchInput: string;
	locationInput: string;
	jobResults: JobListing[];
	loading: boolean;
}

const initialState: JobSearchState = {
	searchInput: "",
	locationInput: "",
	jobResults: [],
	loading: false,
};

enum JOB_SEARCH_ACTION {
	SET_JOB_RESULTS,
	SET_SEARCH_INPUTS,
	SET_LOADING,
}

interface Action {
	type: JOB_SEARCH_ACTION;
	payload: {
		searchInput?: string;
		locationInput?: string;
		jobResults?: JobListing[];
		loading?: boolean;
	};
}

const JobSearchReducer = (
	state: JobSearchState,
	action: Action
): JobSearchState => {
	switch (action.type) {
		case JOB_SEARCH_ACTION.SET_JOB_RESULTS:
			return { ...state, jobResults: action.payload.jobResults ?? [] };
		case JOB_SEARCH_ACTION.SET_SEARCH_INPUTS:
			return {
				...state,
				searchInput: action.payload.searchInput ?? state.searchInput,
				locationInput:
					action.payload.locationInput ?? state.locationInput,
			};
		case JOB_SEARCH_ACTION.SET_LOADING:
			return { ...state, loading: action.payload.loading ?? false };
		default:
			return state;
	}
};

const Jobs: NextPage<JobsProps> = (props: JobsProps) => {
	const router = useRouter();
	const [jobSearchState, dispatch] = useReducer(
		JobSearchReducer,
		initialState
	);

	// QUERY FROM ADDRESS BAR
	const oldQuery = {
		search: router.query.search as string,
		location: router.query.location as string,
	};

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

	// RUNS ONCE WHEN THE PAGE LOADS
	// Sets the initial stuff
	useEffect(() => {
		// SET THE CURRENT JOB LISTINGS TO DATA FETCHED FROM THE SERVER
		dispatch({
			type: JOB_SEARCH_ACTION.SET_JOB_RESULTS,
			payload: { jobResults: props.jobResults.results },
		});
		// SET THE SEARCH AND LOCATION INPUT TO THE URL QUERIES
		dispatch({
			type: JOB_SEARCH_ACTION.SET_SEARCH_INPUTS,
			payload: {
				searchInput: oldQuery.search,
				locationInput: oldQuery.location,
			},
		});
	}, []);

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
				`http://localhost:3000/api/jobs/studentjob?search=${jobSearchState.searchInput
					.split(" ")
					.join("+")}&where=${jobSearchState.locationInput
					.split(" ")
					.join("+")}`
			);
			const data: { results: JobListing[] } = await response.json();

			if (!response.ok) throw new Error(JSON.stringify(data, null, 4));

			console.log(JSON.stringify(data, null, 4));
			dispatch({
				type: JOB_SEARCH_ACTION.SET_JOB_RESULTS,
				payload: { jobResults: data.results },
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
		<div>
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
					<div className="px-6 py-5 flex justify-center items-start gap-5">
						{/* FILTERS */}
						<aside className="px-5 border-[1px] flex flex-col divide-y-2 border-slate-300 bg-white rounded-lg">
							{/* DISTANCE FILTERS */}
							<div className="w-[15rem] py-5 flex flex-col items-start gap-3">
								<p className="font-bold">Distance</p>
								{distanceTypes.map((distance) => (
									<div
										key={distance}
										className="w-full flex justify-start gap-4 items-center "
									>
										<input
											type="radio"
											name="Distance"
											value={distance}
											className="w-5 h-5"
										/>
										<label>Within {distance}km</label>
									</div>
								))}
							</div>

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
						<main>
							{jobSearchState.jobResults &&
							jobSearchState.jobResults.length > 0 ? (
								// SHOW SKELETON JOB RESULTS WHEN LOADING
								jobSearchState.loading ? (
									<div className="flex flex-col items-start justify-start gap-5">
										{[1, 2, 3, 4, 5].map(() => (
											<LoadingJobListing />
										))}
									</div>
								) : (
									<div className="w-full flex flex-col items-start gap-5">
										{jobSearchState.jobResults.map(
											(job, index) => (
												<div
													key={index}
													className="p-5 border-[1px] border-slate-300 bg-white w-80 rounded-lg"
												>
													<p className="font-bold">
														{job.jobTitle}
													</p>
													<p>{job.jobLocation}</p>
													<p>{job.jobDescription}</p>
												</div>
											)
										)}
									</div>
								)
							) : (
								<div>No jobs</div>
							)}
						</main>
					</div>
				) : (
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
										router.push({
											pathname: "/jobs",
											query: { search: job },
										});
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
		</div>
	);
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
	const search = (context.query.search as string) ?? "";
	const location = (context.query.location as string) ?? "";
	console.log(search, location);
	if (search === "") return { props: { search, jobResults: [] } };
	const URL = `http://localhost:3000/api/jobs/studentjob?search=${search
		.split(" ")
		.join("+")}&location=${location.split(" ").join("+")}`;
	const response = await fetch(URL);
	const jobResults = await response.json();
	return { props: { search, jobResults } };
}

export default Jobs;

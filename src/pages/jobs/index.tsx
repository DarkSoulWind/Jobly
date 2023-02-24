"DEFAULT JOB SEARCH PAGE";

import { useState, FormEvent } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";

// COMPONENTS
import Navbar from "src/components/nav/Navbar";
import Footer from "src/components/footer/Footer";
import { FaLocationArrow, FaSearch } from "react-icons/fa";
import { PRODUCTION_URL } from "@utils/url.mjs";

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

const Jobs: NextPage = () => {
	const router = useRouter();
	const [searchInput, setSearchInput] = useState("");
	const [locationInput, setLocationInput] = useState("");

	/**
	 * It takes the search and location inputs from the state, and then uses them to fetch the job listings
	 * from the API
	 * @param event - FormEvent<HTMLFormElement>
	 */
	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const query = {
			location: locationInput,
			distance: "10",
			type: "",
		};
		router.push({
			pathname: `/jobs/search/${searchInput}`,
			query,
		});
	};

	return (
		<>
			<Head>
				<title>Find a job</title>
				<meta name="description" content="Find a job" />
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
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
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
							value={locationInput}
							onChange={(e) => setLocationInput(e.target.value)}
						/>
					</div>

					<input
						type="submit"
						className="py-2 px-4 cursor-pointer bg-blue-700 hover:bg-blue-900 text-white disabled:bg-blue-900 disabled:cursor-wait ease-in-out transition-all font-semibold rounded-full"
						value="Find job"
					/>
				</form>

				<div className="py-10 text-center space-y-4 max-w-[50rem]">
					<p className="font-semibold text-lg">Popular searches</p>

					<div className="flex flex-wrap gap-3 items-center justify-center">
						{popularSearches.map((job, index) => (
							<Link
								key={index}
								onClick={() => setSearchInput(job)}
								href={
									`${PRODUCTION_URL}/jobs/search/${job}?` +
									new URLSearchParams({
										distance: "10",
										location: "",
										type: "",
									})
								}
							>
								<a className="p-2 flex items-center gap-3 bg-gray-300 hover:bg-gray-400/60 transition-all rounded-lg text-sm font-light">
									<FaSearch className="fill-slate-600" />

									<p>{job}</p>
								</a>
							</Link>
						))}
					</div>
				</div>
			</div>

			<Footer />
		</>
	);
};

export default Jobs;

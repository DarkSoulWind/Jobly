import type { NextPage } from "next";
import Head from "next/head";
import Navbar from "@components/nav/Navbar";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { SavedJob } from "@prisma/client";
import { useQuery } from "react-query";
import JobListingComponent from "@components/job/JobListing";
import SelectedPreview from "@components/job/SelectedPreview";
import { SiteType } from "@lib/scraper";
import { useRouter } from "next/router";

const SavedJobsPage: NextPage = () => {
	const router = useRouter();
	const { data: sessionData } = useSession();

	const fetchSavedJobs = async () => {
		const response = await fetch(
			`http://localhost:3000/api/jobs/save/${sessionData?.user?.email!}`
		);
		const responseData: SavedJob[] = await response.json();
		return responseData;
	};

	const {
		data: savedJobs,
		isError: savedJobsError,
		isFetching: savedJobsFetching,
	} = useQuery("saved-jobs", fetchSavedJobs);

	const [selectedJob, setSelectedJob] = useState({
		index: Infinity,
		link: "",
		type: "",
	});

	return (
		<>
			<Head>
				<title>Saved Jobs • Jobly</title>
				<meta name="description" content="Your saved jobs." />
			</Head>

			<Navbar />

			<div className="background"></div>

			<div className="pt-[4.25rem] px-5">
				<h4 className="text-4xl font-bold">
					{savedJobs && savedJobs.length > 0
						? "Your saved jobs:"
						: "No saved jobs."}
				</h4>

				<main className="flex gap-5 mt-5 sticky top-[4.5rem]">
					<section className="flex flex-col gap-5">
						{savedJobs?.map((savedJob, index) => {
							const {
								title,
								employer,
								link,
								location,
								description,
								type,
							} = savedJob;
							return (
								<JobListingComponent
									key={savedJob.link}
									selected={index === selectedJob.index}
									onClick={() =>
										setSelectedJob({ index, link, type })
									}
									job={{
										title,
										employer,
										link,
										location,
										description,
										type: type as SiteType,
									}}
								/>
							);
						})}
					</section>

					{selectedJob.link !== "" && (
						<SelectedPreview
							link={selectedJob.link}
							type={selectedJob.type}
							isSaved={
								!!savedJobs!.find(
									(savedJob) =>
										savedJob.link === selectedJob.link
								)
							}
							router={router}
						/>
					)}
				</main>
			</div>
		</>
	);
};

export default SavedJobsPage;

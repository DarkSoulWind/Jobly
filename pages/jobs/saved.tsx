import type { NextPage } from "next";
import Head from "next/head";
import Navbar from "../../components/nav/Navbar";
import React from "react";

const SavedJobsPage: NextPage = () => {
	return (
		<>
			<Head>
				<title>Saved Jobs • Jobly</title>
				<meta name="description" content="Your saved jobs." />
			</Head>

			<Navbar />

			<div className="background"></div>
			<div className="pt-[4.25rem] px-5">
				<h4 className="text-4xl font-bold">Your saved jobs:</h4>
			</div>
		</>
	);
};

export default SavedJobsPage;

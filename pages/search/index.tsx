import Head from "next/head";
import React from "react";
import Navbar from "../../components/nav/Navbar";

const SearchPage = () => {
	return (
		<>
			<Head>
				<title>deez nuts • Jobly</title>
			</Head>
			<Navbar />
			<div className="background"></div>
			<div className="w-full h-full">
				<div className="w-full h-[20rem] bg-indigo-400 flex flex-col justify-center items-center">
					<h2 className="text-3xl font-bold text-white">
						Your results for: deez nuts
					</h2>
				</div>
			</div>
		</>
	);
};

export default SearchPage;

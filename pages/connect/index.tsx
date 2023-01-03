import { NextPage } from "next";
import React, { DetailedHTMLProps, FC, HTMLAttributes } from "react";
import Navbar from "../../components/nav/Navbar";
import PFP from "../../public/images/DefaultPFP.jpeg";
import Image from "next/image";
import Head from "next/head";

const ConnectPage: NextPage = () => {
	return (
		<>
			<Head>
				<title>Connect • Jobly</title>
			</Head>
			<Navbar />
			<div className="background"></div>

			<div className="pt-[4.5rem] w-full h-full flex justify-center">
				<main className="w-[60rem] h-[55rem] border-[1px] border-slate-300 bg-white rounded-xl p-3">
					<h3 className="text-2xl font-bold">Connect with people</h3>
					<div className="flex flex-col gap-2 py-2">
						{new Array(6).fill(1).map((i, index) => (
							<RecommendedListing key={index} />
						))}
					</div>
				</main>
			</div>
		</>
	);
};

const RecommendedListing: FC<
	DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
> = ({ key }) => {
	return (
		<div className="flex justify-between items-center" key={key}>
			<div className="flex items-center gap-2">
				<div className="w-14 h-14">
					<Image
						width="100%"
						height="100%"
						alt="pfp"
						src="/images/DefaultPFP.jpeg"
					/>
				</div>
				<div className="text-sm">
					<p className="font-bold">Ekin</p>
					<p>Suiiiiiii</p>
				</div>
			</div>
			<button
				className="py-1 px-4 rounded-full hover:bg-blue-100 transition-all text-blue-500 font-semibold border-2 border-blue-500"
				onClick={() => console.log("suiiii")}
			>
				Follow
			</button>
		</div>
	);
};

export default ConnectPage;

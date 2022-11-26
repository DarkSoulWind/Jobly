import { useRouter } from "next/router";
import Link from "next/link";
import React from "react";
import Navbar from "@components/nav/Navbar";

const PageNotFound = () => {
	return (
		<div>
			<Navbar />
			<div className="w-screen h-screen flex justify-center items-center">
				<div className="flex flex-col items-center gap-8">
					<div className="flex items-start divide-x-[1px] divide-black">
						<h1 className="pr-5 text-6xl font-bold text-indigo-500">
							404
						</h1>
						<div className="pl-5">
							<h2 className="text-6xl font-bold">
								Page not found
							</h2>
							<p className="mt-3">
								Please check the URL in the address bar and try
								again.
							</p>
						</div>
					</div>
					<Link href={"/"}>
						<a className="text-xl hover:text-indigo-500">
							Return home
						</a>
					</Link>
				</div>
			</div>
			<div className="background"></div>
		</div>
	);
};

export default PageNotFound;

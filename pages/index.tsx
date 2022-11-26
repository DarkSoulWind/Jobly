import type { NextPage } from "next";
import { useRef, FormEvent } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Footer from "@components/footer/Footer";
import Navbar from "@components/nav/Navbar";
import HomeBackground from "../public/images/HomeBackground.jpeg";
import Image from "next/image";
import { FaSearch } from "react-icons/fa";
import { useSession } from "next-auth/react";

const Home: NextPage = () => {
	const router = useRouter();
	const { status } = useSession();
	const searchRef = useRef<HTMLInputElement>(null);

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const searchQuery = searchRef.current?.value.split(" ").join("+");
		const URL = `/jobs?search=${searchQuery}`;
		router.push(URL);
	};

	if (status === "authenticated") {
		router.push("/feed");
	}

	return (
		<>
			<Head>
				<title>Job Search | Jobly</title>
				<meta
					name="description"
					content="Where to find your next job."
				/>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<div className="background"></div>

			<Navbar />

			<div className="pt-[3.5rem]">
				<div className="h-[512px] w-full bg-black">
					<div className="relative h-full w-full">
						<Image
							className="absolute h-full w-full"
							src={HomeBackground}
							alt="job-bg"
							layout="fill"
						/>

						<div className="flex h-full w-full items-center justify-center">
							<div className="absolute w-[40rem] p-10 rounded-2xl flex flex-col items-center gap-5">
								<div className="text-center text-white">
									<h3 className="text-6xl my-4 font-bold">
										Find your next job now
									</h3>

									<h4 className="font-semibold text-xl">
										Search through hundreds of jobs
									</h4>
								</div>

								<form
									onSubmit={handleSubmit}
									className="flex w-[50rem] mt-4 py-6 px-7 items-center gap-5 bg-slate-200/30 rounded-full backdrop-blur-sm"
								>
									<input
										className="w-full rounded-md placeholder:text-gray-300 text-white bg-transparent outline-none"
										placeholder="Software Engineering"
										type="text"
										ref={searchRef}
									/>

									<button type="submit">
										<FaSearch className="fill-gray-300 w-7 h-7" />
									</button>
								</form>
							</div>
						</div>
					</div>
				</div>
				<div className="w-full text-center py-10">
					<p className="text-5xl font-bold">Popular jobs</p>
				</div>
			</div>

			<Footer />
		</>
	);
};

export default Home;

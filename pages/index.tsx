import type { NextPage } from "next";
import { useRef, FormEvent } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Footer from "../components/footer/Footer";
import Navbar from "../components/nav/Navbar";

const Home: NextPage = () => {
	const router = useRouter();
	const searchRef = useRef<HTMLInputElement>(null);

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const searchQuery = searchRef.current?.value.split(" ").join("+");
		const URL = `/jobs?search=${searchQuery}`;
		router.push(URL);
	};

	return (
		<div>
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
			<main className="pt-[3.5rem]">
				<div className="h-[512px] w-full bg-black">
					<div className="relative h-full w-full">
						<img
							className="absolute h-full w-full"
							src="https://fjwp.s3.amazonaws.com/blog/wp-content/uploads/2020/01/11140027/send-email-1024x512.png"
							alt="job-bg"
						/>
						<div className="flex h-full w-full items-center justify-center">
							<div className="absolute flex flex-col items-center gap-5">
								<div className="my-7 text-5xl font-bold text-fuchsia-500">
									Find a job now
								</div>
								<form
									onSubmit={handleSubmit}
									className="flex flex-col items-center gap-5"
								>
									<div className="flex w-[200%] items-center gap-3 rounded-md border-[1px] border-black bg-white px-3 py-2 text-sm">
										<div className="font-bold">What</div>
										<input
											className="w-full rounded-md bg-transparent outline-none"
											placeholder="Software Engineering"
											type="text"
											ref={searchRef}
										/>
									</div>
									<input
										type="submit"
										className="rounded-md bg-blue-600 p-2 font-bold text-white transition-all hover:cursor-pointer hover:bg-blue-400"
										value="Find job"
									/>
								</form>
							</div>
						</div>
					</div>
				</div>
			</main>
			<Footer />
		</div>
	);
};

export default Home;

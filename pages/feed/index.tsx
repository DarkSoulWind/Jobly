"FEED PAGE";

import type { NextPage } from "next";
import React, { useEffect, useReducer, useState } from "react";
import Image from "next/image";
import Head from "next/head";
import Navbar from "@components/nav/Navbar";
import Footer from "@components/footer/Footer";
import LookingForJob from "@public/images/LookingForJob.png";
import { useModal } from "@hooks/useModal";
import { useQuery } from "react-query";
import CreatePostModal from "@components/modal/CreatePostModal";
import { Post, User } from "@prisma/client";
import {
	PostsUserPostLikesComments,
	feedReducer,
	FeedState,
	UserWithPreferences,
	FEED_ACTION,
} from "@reducers/feedReducer";
import PostComponent from "@components/post/Post";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Alert from "@components/alert/Alert";
import SkeletonLoaderPost from "@components/post/SkeletonLoaderPost";
import { AnimatePresence } from "framer-motion";

// INITIALIZER FOR GLOBAL STATE FOR THIS COMPONENT
const initFeedState = ({}): FeedState => {
	return {
		posts: null,
		error: "",
		success: "",
	};
};

const Feed: NextPage = () => {
	const { data } = useSession();
	const router = useRouter();

	// GLOBAL FEED STATE
	const [feedState, dispatch] = useReducer(feedReducer, {}, initFeedState);

	// MODALS OR POPUPS
	const [lookingForAJob, setLookingForAJob] = useState(false);
	const [createPostModalOpen, setCreatePostModalOpen, toggleCreatePostModal] =
		useModal(false);

	const getUserByEmail = async () => {
		const response = await fetch(
			`http://localhost:3000/api/user/email/${data?.user?.email}`
		);
		const responseData: UserWithPreferences | null = await response.json();
		console.log("YOUR DATA:", JSON.stringify(responseData, null, 4));
		return responseData;
	};

	const getRecommendedPosts = async () => {
		const response = await fetch(
			`http://localhost:3000/api/feed/recommend/${data?.user?.email}`
		);
		const responseData: (Post & {
			user: {
				name: string;
			};
		})[] = await response.json();
		return responseData;
	};

	// FETCH YOUR USER DATA
	const {
		data: yourData,
		isError: yourDataFetchError,
		isLoading: yourDataFetchLoading,
	} = useQuery("yourData", getUserByEmail);

	// FETCH RECOMMENDED POSTS
	const {
		data: posts,
		isError: postsFetchError,
		isLoading: postsFetchLoading,
	} = useQuery("posts", getRecommendedPosts);

	// RUNS ONCE WHEN THE PAGE IS MOUNTED
	useEffect(() => {
		setLookingForAJob(
			JSON.parse(localStorage.getItem("lookingForAJob") ?? "true")
		);
	}, []);

	return (
		<>
			<Head>
				<title>Feed • Jobly</title>
				<meta name="description" content="User feed" />
			</Head>

			<Navbar />

			<div className="background"></div>

			<div className="w-full flex flex-col items-center pt-14">
				<div
					className={`${
						feedState.success ? "mt-16" : ""
					} w-full relative p-5 gap-5 flex justify-center items-start`}
				>
					{/* SIDE PROFILE */}
					<aside className="hidden md:block relative w-[15rem]">
						<div className="fixed w-[15rem] overflow-clip grid grid-cols-1 bg-white border-[1px] border-slate-300 rounded-lg">
							<img
								src={
									yourDataFetchError || yourDataFetchLoading
										? "https://swall.teahub.io/photos/small/303-3034192_default-banner-banner-jpg.jpg"
										: yourData?.preferences?.banner ??
										  "https://swall.teahub.io/photos/small/303-3034192_default-banner-banner-jpg.jpg"
								}
								alt="banner"
							/>
							<div className="flex flex-col items-center">
								<div className="w-full relative flex justify-center">
									<div className="absolute -top-9">
										{/* MINIPROFILE PFP */}
										<img
											className="aspect-square border-white border-2 rounded-full w-16 h-16"
											src={
												yourData?.image ??
												"https://i.pinimg.com/736x/dd/f0/11/ddf0110aa19f445687b737679eec9cb2.jpg"
											}
											onError={(e) => {
												e.preventDefault();
												console.log(
													"ERROR LOADING IMAGE"
												);
												e.currentTarget.onerror = null;
												e.currentTarget.classList.add(
													"animate-pulse"
												);
												e.currentTarget.src =
													"https://i.pinimg.com/736x/dd/f0/11/ddf0110aa19f445687b737679eec9cb2.jpg";
											}}
											alt="pfp"
										/>
									</div>
								</div>
								<div className="pt-9 pb-4 text-center">
									<h3 className="font-bold text-md">
										{yourDataFetchLoading && (
											<h3 className="font-bold text-md">
												Loading...
											</h3>
										)}
										{yourDataFetchError && (
											<h3 className="font-bold text-md">
												Error fetching profile
											</h3>
										)}
										{yourData?.preferences?.firstName ??
											yourData?.name}{" "}
										{yourData?.preferences?.lastName ?? ""}
									</h3>
									<h4 className="text-sm text-slate-500">
										{yourData?.preferences?.bio ??
											"Empty bio"}
									</h4>
									<button
										onClick={() =>
											router.push(
												`/user/${yourData?.name}`
											)
										}
										className="font-bold tracking-wide mt-4 text-lg"
									>
										View full profile
									</button>
								</div>
							</div>
						</div>
					</aside>

					<div className="w-[30rem] flex flex-col gap-2 items-center justify-start">
						{/* Hi, are you looking for a job now card */}
						{lookingForAJob && (
							<div className="bg-white w-full shadow-lg shadow-slate-300 rounded-lg flex flex-col items-center border-[1px] border-slate-300 p-6 text-center">
								<div className="w-40 aspect-square">
									<Image
										src={LookingForJob}
										objectFit="fill"
										alt="Looking for a job"
									/>
								</div>
								<h3 className="text-xl font-semibold">
									Hi, are you looking for a job now?
								</h3>
								<h4 className="text-lg font-light mt-3">
									We can help you prepare for your search.
									Your response is private to you.
								</h4>
								<div className="w-full mt-3 flex justify-center items-center gap-3">
									<button
										onClick={() => {
											setLookingForAJob(false);
											localStorage.setItem(
												"lookingForAJob",
												"false"
											);
										}}
										className="w-full mt-2 font-semibold text-md py-[0.1rem] text-blue-500 border-[1px] hover:border-2 hover:bg-blue-100 transition-all border-blue-500 rounded-full"
									>
										Yes
									</button>
									<button
										onClick={() => {
											setLookingForAJob(false);
											localStorage.setItem(
												"lookingForAJob",
												"false"
											);
										}}
										className="w-full mt-2 font-semibold text-md py-[0.1rem] text-blue-500 border-[1px] hover:border-2 hover:bg-blue-100 transition-all border-blue-500 rounded-full"
									>
										No
									</button>
								</div>
							</div>
						)}
						{/* STARTING A POST */}
						<div className="w-full bg-white rounded-lg border-[1px] shadow-lg shadow-slate-300 border-slate-300 p-3">
							<div className="flex items-center gap-3">
								<img
									src={data?.user?.image ?? ""}
									alt="pfp"
									className="w-14 rounded-full aspect-square"
									onError={(e) => {
										e.preventDefault();
										console.log("ERROR LOADING IMAGE");
										e.currentTarget.onerror = null;
										e.currentTarget.classList.add(
											"animate-pulse"
										);
										e.currentTarget.src =
											"https://i.pinimg.com/736x/dd/f0/11/ddf0110aa19f445687b737679eec9cb2.jpg";
									}}
								/>
								<button
									onClick={toggleCreatePostModal}
									className="font-light text-slate-600 bg-slate-200/70 hover:bg-slate-200 transition-all rounded-full w-full text-left px-4 py-[0.85rem]"
								>
									Start a post
								</button>
							</div>
						</div>

						{/* SHOW POSTS */}
						<div className="flex flex-col w-full gap-2">
							{postsFetchLoading &&
								[1, 2, 3].map(() => <SkeletonLoaderPost />)}

							{postsFetchError && <p>Error loading posts.</p>}

							<div className="flex flex-col items-center gap-2">
								{posts?.map((post) => (
									<div className="w-full" key={post.id}>
										<PostComponent
											postData={post}
											yourData={
												yourData as UserWithPreferences
											}
											pageExpanded={false}
											dispatch={dispatch}
										/>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* FOR CREATING POSTS */}
			<AnimatePresence
				initial={false}
				mode="wait"
				onExitComplete={() => null}
			>
				{createPostModalOpen && (
					<CreatePostModal
						modalOpen={createPostModalOpen}
						toggle={toggleCreatePostModal}
						userData={yourData as User}
						dispatch={dispatch}
					/>
				)}
				{/* </AnimatePresence>

			<AnimatePresence
				initial={false}
				mode="wait"
				onExitComplete={() => null}
			> */}
				{feedState.success !== "" && (
					<Alert
						level="Success"
						message={feedState.success as string}
						open={(feedState.success?.length || false) > 0}
						closeAction={() =>
							dispatch({
								type: FEED_ACTION.SET_SUCCESS_MESSAGE,
								payload: { success: "" },
							})
						}
					/>
				)}
				{feedState.error !== "" && (
					<Alert
						level="Error"
						message={feedState.error as string}
						open={(feedState.error?.length || false) > 0}
						closeAction={() =>
							dispatch({
								type: FEED_ACTION.SET_ERROR_MESSAGE,
								payload: { error: "" },
							})
						}
					/>
				)}
			</AnimatePresence>

			<Footer />
		</>
	);
};

export default Feed;

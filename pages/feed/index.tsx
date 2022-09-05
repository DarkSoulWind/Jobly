import type { NextPage } from "next";
import React, { useEffect, useReducer, useState } from "react";
import Image from "next/image";
import Head from "next/head";
import Navbar from "../../components/nav/Navbar";
import Footer from "../../components/footer/Footer";
import LookingForJob from "../../public/images/LookingForJob.png";
import { useModal } from "../../hooks/useModal";
import CreatePostModal from "../../components/modal/CreatePostModal";
import { User } from "@prisma/client";
import {
	PostsUserPostLikesComments,
	feedReducer,
	FeedState,
	UserWithPreferences,
	FEED_ACTION,
} from "../../reducers/feedReducer";
import PostComponent from "../../components/post/Post";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Alert from "../../components/alert/Alert";
import SkeletonLoaderPost from "../../components/post/SkeletonLoaderPost";

// INITIALIZER FOR GLOBAL STATE FOR THIS COMPONENT
const initFeedState = ({}): FeedState => {
	return {
		posts: null,
		error: null,
		success: "",
	};
};

const Feed: NextPage = () => {
	const { status, data } = useSession();
	const router = useRouter();

	// GLOBAL FEED STATE
	const [feedState, dispatch] = useReducer(feedReducer, {}, initFeedState);

	// STORES YOUR USER DATA
	const [yourData, setYourData] = useState<UserWithPreferences | null>();

	// MODALS OR POPUPS
	const [lookingForAJob, setLookingForAJob] = useState(false);
	const [createPostModalOpen, setCreatePostModalOpen, toggleCreatePostModal] =
		useModal(false);

	// RUNS ONCE WHEN THE PAGE IS MOUNTED
	useEffect(() => {
		const abortController = new AbortController();

		setLookingForAJob(
			JSON.parse(localStorage.getItem("lookingForAJob") ?? "true")
		);

		// get your user data
		const getUserByEmail = async () => {
			const response = await fetch(
				`http://localhost:3000/api/user/email/${data?.user?.email}`,
				{ signal: abortController.signal }
			);
			const responseData: UserWithPreferences | null =
				await response.json();
			setYourData(responseData);
		};

		// fetch posts recommended to you
		const getRecommendedPosts = async () => {
			const response = await fetch(
				`http://localhost:3000/api/feed/recommend/${data?.user?.email}`,
				{ signal: abortController.signal }
			);
			const responseData: PostsUserPostLikesComments[] | null =
				await response.json();
			dispatch({
				type: FEED_ACTION.SET_POSTS,
				payload: {
					posts: responseData as PostsUserPostLikesComments[],
				},
			});
		};

		getUserByEmail();
		setTimeout(getRecommendedPosts, 1000);
		// getRecommendedPosts();

		return () => {
			setTimeout(() => {
				abortController.abort();
			}, 2000);
		};
	}, []);

	return (
		<div className="overflow-clip">
			<Head>
				<title>Feed • Jobly</title>
				<meta name="description" content="User feed" />
			</Head>
			<Navbar />
			<div className="background"></div>

			<div className="w-full flex flex-col items-center pt-14">
				{feedState.success && (
					<div className="fixed w-full px-10 z-10">
						<Alert
							level="Success"
							message={feedState.success}
							open={feedState.success.length > 0}
							closeAction={() =>
								dispatch({
									type: FEED_ACTION.SET_SUCCESS_MESSAGE,
									payload: { success: "" },
								})
							}
						/>
					</div>
				)}
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
									yourData?.preferences?.Banner ??
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
										{yourData?.preferences?.FirstName ??
											yourData?.name}{" "}
										{yourData?.preferences?.LastName ?? ""}
									</h3>
									<h4 className="text-sm text-slate-500">
										{yourData?.preferences?.Bio ??
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
									onClick={
										toggleCreatePostModal as () => void
									}
									className="border-[1px] font-semibold text-slate-600 border-slate-500 hover:bg-slate-200 transition-all rounded-full w-full text-left px-4 py-[0.85rem]"
								>
									Start a post
								</button>
							</div>
						</div>

						{/* SHOW POSTS */}
						<div className="flex flex-col w-full gap-2">
							{feedState.posts
								? feedState?.posts?.map((post) => (
										<div
											className="w-full"
											key={post.PostID}
										>
											<PostComponent
												postData={post}
												yourData={
													yourData as UserWithPreferences
												}
												pageExpanded={false}
												dispatch={dispatch}
											/>
										</div>
								  ))
								: [1, 2, 3].map(() => <SkeletonLoaderPost />)}
						</div>
					</div>
				</div>
			</div>

			{/* FOR CREATING POSTS */}
			<CreatePostModal
				modalOpen={createPostModalOpen as boolean}
				toggle={toggleCreatePostModal as () => void}
				userData={yourData as User}
			/>
			<Footer />
		</div>
	);
};

export default Feed;

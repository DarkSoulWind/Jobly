"JOB POST PAGE";

import React, { useEffect, useRef, useState } from "react";
import type { GetStaticPropsContext, NextPage } from "next";
import {
	Post,
	User,
	UserPreference,
	PostLike,
	Comment,
	Follow,
} from "@prisma/client";
import { prisma } from "@lib/prisma";
import Navbar from "@components/nav/Navbar";
import Head from "next/head";
import PostComponent from "@components/post/Post";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useQuery } from "react-query";
import CommentComponent from "@components/comments/Comment";

// CANNOT USE INFER GET SERVER SIDE PROPS
interface PostPageProps {
	postData:
		| Post & {
				user: User & {
					preferences: UserPreference | null;
				};
				comments: Comment[];
				postLikes: PostLike[];
		  };
	posterData:
		| (User & {
				preferences: UserPreference | null;
		  })
		| null;
	commentData: (Comment & {
		user: User & {
			preferences: UserPreference | null;
		};
	})[];
}

type UserWithPreferences = {
	preferences: UserPreference | null;
	followers: Follow[];
	following: Follow[];
	id: string;
} | null;

const PostPage: NextPage<PostPageProps> = ({
	postData,
	posterData,
	commentData,
}) => {
	const router = useRouter();
	const { status, data } = useSession();
	console.log(commentData);

	// STATE AND REFS
	const commentInputRef = useRef<HTMLInputElement>(null);
	const [CommentText, setCommentText] = useState("");

	// YOUR DATA
	// const [yourData, setYourData] = useState<UserWithPreferences | null>();

	const getUserByEmail = async () => {
		if (status === "authenticated") {
			const response = await fetch(
				`http://localhost:3000/api/user/email/${data.user?.email}`
			);
			const responseData: UserWithPreferences | null =
				await response.json();
			console.log(
				"YOUR DATA FROM RQ",
				JSON.stringify(responseData, null, 4)
			);
			return responseData;
		}
	};

	const { data: yourData } = useQuery("yourData", getUserByEmail);

	// useEffect(() => {

	// 	getUserByEmail();
	// }, []);

	const postComment = async () => {
		if (CommentText.trim().length < 5) return;

		try {
			const body = {
				CommentText,
				UserID: yourData?.id,
				PostID: postData?.id,
				DatePosted: new Date(Date.now()).toISOString(),
			};
			console.log("Posting...");
			const response = await fetch(
				"http://localhost:3000/api/comments/add",
				{
					method: "POST",
					body: JSON.stringify(body),
				}
			);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data);
			}
			console.log(
				"Comment added successfully",
				JSON.stringify(data, null, 4)
			);
			setCommentText("");
		} catch (error) {
			console.error(JSON.stringify(error, null, 4));
		}
	};

	return (
		<div className="overflow-clip">
			<Head>
				<title>
					{posterData?.name} | "{postData?.postText.substring(0, 30)}
					{postData && postData?.postText.length > 30 ? "..." : ""}"
				</title>
				<meta name="description" content={postData?.postText} />
			</Head>

			<Navbar />

			<div className="background"></div>

			<div className="w-screen relative p-5 gap-5 flex justify-center items-start">
				{/* SIDE PROFILE */}
				<aside className="hidden md:block relative mt-[3.5rem] w-[15rem]">
					<div className="fixed w-[15rem] overflow-clip grid grid-cols-1 bg-white border-[1px] border-slate-300 rounded-lg">
						<img
							src={
								posterData?.preferences?.banner ??
								"https://swall.teahub.io/photos/small/303-3034192_default-banner-banner-jpg.jpg"
							}
							alt="banner"
						/>
						<div className="flex flex-col items-center">
							<div className="w-full relative flex justify-center">
								<div className="absolute -top-9">
									<img
										className="aspect-square border-white border-2 rounded-full w-16 h-16"
										src={
											posterData?.image ??
											"https://i.pinimg.com/736x/dd/f0/11/ddf0110aa19f445687b737679eec9cb2.jpg"
										}
										alt="pfp"
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
								</div>
							</div>
							<div className="pt-9 pb-4 text-center">
								<h3 className="font-bold text-md">
									{posterData?.preferences?.firstName ??
										posterData?.name}{" "}
									{posterData?.preferences?.lastName ?? ""}
								</h3>
								<h4 className="text-sm text-slate-500">
									{posterData?.preferences?.bio ??
										"Empty bio"}
								</h4>
								<button
									onClick={() =>
										router.push(`/user/${posterData?.name}`)
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
					{/* MAIN POST */}
					<main className="w-[30rem] flex flex-col mt-[3.5rem] gap-2 items-center justify-start">
						<div className="w-full">
							<PostComponent
								postData={postData}
								yourData={yourData as UserWithPreferences}
								pageExpanded={true}
								commentInputRef={commentInputRef}
							/>
						</div>
					</main>

					{/* POST A COMMENT */}
					<div className="w-full bg-white rounded-lg border-[1px] shadow-lg shadow-slate-300 border-slate-300 p-3">
						<div className="flex items-start justify-start gap-2">
							<img
								src={data?.user?.image ?? ""}
								alt="pfp"
								className="w-12 rounded-full aspect-square"
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
							<div className="w-full flex flex-col justify-start items-start gap-2">
								<input
									type="text"
									ref={commentInputRef}
									placeholder="Post a comment"
									value={CommentText}
									onChange={(e) =>
										setCommentText(e.target.value)
									}
									className="border-[1px] text-sm text-slate-600 border-slate-500 transition-all rounded-full w-full text-left px-4 py-3"
								/>
								{/* POST COMMENT BUTTON */}
								{CommentText.trim().length > 0 && (
									<button
										onClick={postComment}
										className="py-1 px-4 bg-blue-500 rounded-full hover:bg-blue-700 transition-all text-sm text-white font-semibold"
									>
										Post
									</button>
								)}
							</div>
						</div>
						<hr className="my-4" />

						{/* COMMENTS */}
						<div className="w-full flex flex-col items-start justify-start gap-3">
							{commentData?.map((comment) => (
								<div className="w-full" key={comment.id}>
									<CommentComponent
										commentData={comment}
										author={
											posterData?.email ===
											comment.user.email
										}
										yourData={yourData}
									/>
								</div>
							))}
						</div>
						{commentData.length === 0 && (
							<h5 className="text-center">No comments</h5>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export async function getStaticPaths() {
	const data = await prisma.post.findMany({
		select: {
			id: true,
		},
	});

	const paths = data.map((post) => ({
		params: { postID: post.id.toString() },
	}));

	return { paths, fallback: false };
}

export async function getStaticProps(context: GetStaticPropsContext) {
	const { postID } = context.params as { postID: string };
	const postData = await prisma.post.findUnique({
		where: {
			id: postID,
		},
		include: {
			postLikes: true,
			comments: true,
			user: {
				include: {
					preferences: true,
				},
			},
		},
	});
	const posterData = await prisma.user.findUnique({
		where: {
			id: postData?.userID,
		},
		include: {
			preferences: true,
		},
	});
	const commentData = await prisma.comment.findMany({
		where: {
			postID,
		},
		include: {
			user: {
				include: {
					preferences: true,
				},
			},
		},
	});

	return {
		props: {
			postData: JSON.parse(JSON.stringify(postData)),
			posterData,
			commentData: JSON.parse(JSON.stringify(commentData)),
			fallback: false,
		},
	};
}

export default PostPage;

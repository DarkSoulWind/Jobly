"POST PAGE";

import { useRef, useState } from "react";
import type {
	GetStaticPaths,
	GetStaticProps,
	InferGetStaticPropsType,
	NextPage,
} from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import {
	UserPreference,
	Comment,
	Follow,
	Post,
	PostLike,
	User,
} from "@prisma/client";
import { prisma } from "@lib/prisma";
import Navbar from "@components/nav/Navbar";
import PostComponent from "@components/post/Post";
import CommentComponent from "@components/comments/Comment";
import Alert from "@components/alert/Alert";
import { useQuery } from "react-query";
import { AnimatePresence } from "framer-motion";

type UserWithPreferences = {
	image: string | null;
	name: string;
	preferences: UserPreference | null;
	id: string;
	following: Follow[];
	followers: Follow[];
} | null;

const PostPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
	postData,
	posterData,
	commentData,
}) => {
	const router = useRouter();
	const { status: sessionStatus, data } = useSession();

	// STATE AND REFS
	const commentInputRef = useRef<HTMLInputElement>(null);
	const [commentText, setCommentText] = useState("");
	const [comments, setComments] = useState(commentData);
	const [status, setStatus] = useState({ success: "", error: "" });

	// YOUR DATA
	const getUserByEmail = async () => {
		if (sessionStatus === "authenticated") {
			const response = await fetch(
				`${PRODUCTION_URL}/api/user/email/${data.user?.email}`
			);
			const responseData: UserWithPreferences | null =
				await response.json();
			// console.log(
			// 	"YOUR DATA FROM RQ",
			// 	JSON.stringify(responseData, null, 4)
			// );
			return responseData;
		}
	};

	const { data: yourData } = useQuery("yourData", getUserByEmail);

	const postComment = async () => {
		if (commentText.trim().length < 5) return;

		try {
			const userID = yourData?.id;
			const postID = postData?.id;
			const body = {
				userID,
				postID,
				commentText,
			};
			console.log("Posting...");
			const response = await fetch("${PRODUCTION_URL}/api/comments/add", {
				method: "POST",
				body: JSON.stringify(body),
			});
			const data: Comment & {
				user: {
					name: string;
					image: string | null;
					email: string | null;
					preferences: UserPreference | null;
				};
			} = await response.json();

			if (!response.ok) {
				throw new Error(JSON.stringify(data, null, 4));
			}

			console.log(
				"Comment added successfully",
				JSON.stringify(data, null, 4)
			);
			setComments([...comments, { ...data }]);
			setCommentText("");
			setStatus({ success: "Comment posted successfully!", error: "" });
		} catch (error) {
			console.error(JSON.stringify(error, null, 4));
			setStatus({ success: "", error: "Failed to post comment." });
		}
	};

	return (
		<>
			<Head>
				<title>
					{posterData?.name} | &quot;
					{postData?.postText.substring(0, 30)}
					{postData && postData?.postText.length > 30 ? "..." : ""}
					&quot;
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
									value={commentText}
									onChange={(e) =>
										setCommentText(e.target.value)
									}
									className="border-[1px] text-sm text-slate-600 border-slate-500 transition-all rounded-full w-full text-left px-4 py-3"
								/>
								{/* POST COMMENT BUTTON */}
								{commentText.trim().length > 0 && (
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
							{comments.map((comment) => (
								<div className="w-full" key={comment.id}>
									<CommentComponent
										yourData={yourData}
										commentData={comment}
										isAuthor={
											posterData?.email ===
											comment.user.email
										}
										setComments={setComments}
										setStatus={setStatus}
									/>
								</div>
							))}
						</div>
						{comments.length === 0 && (
							<h5 className="text-center">No comments</h5>
						)}
					</div>
				</div>
			</div>

			<AnimatePresence
				initial={false}
				mode="wait"
				onExitComplete={() => null}
			>
				{status.error !== "" && (
					<Alert
						level="Error"
						message={status.error}
						open={status.error.length > 0}
						closeAction={() =>
							setStatus({ success: "", error: "" })
						}
					/>
				)}

				{status.success !== "" && (
					<Alert
						level="Success"
						message={status.success}
						open={status.success.length > 0}
						closeAction={() =>
							setStatus({ success: "", error: "" })
						}
					/>
				)}
			</AnimatePresence>
		</>
	);
};

export const getStaticPaths: GetStaticPaths = async (context) => {
	const data = await prisma.post.findMany({
		select: {
			id: true,
		},
	});

	const paths = data.map((post) => ({
		params: { postID: post.id.toString() },
	}));

	return { paths, fallback: false };
};

type GetStaticPropsRes = {
	postData:
		| (Post & {
				user: {
					postLikes: {
						userID: string;
						postID: string;
					}[];
					image: string | null;
					name: string;
					preferences: UserPreference | null;
				};
				comments: Comment[];
				postLikes: PostLike[];
		  })
		| null;
	posterData:
		| (User & {
				preferences: UserPreference | null;
		  })
		| null;
	commentData: (Comment & {
		user: {
			image: string | null;
			name: string;
			preferences: UserPreference | null;
			email: string | null;
		};
	})[];
};

export const getStaticProps: GetStaticProps<
	GetStaticPropsRes,
	{ postID: string }
> = async (context) => {
	const postID = context.params?.postID;
	const postData = await prisma.post.findUnique({
		where: {
			id: postID,
		},
		include: {
			postLikes: true,
			comments: true,
			user: {
				select: {
					password: false,
					name: true,
					image: true,
					preferences: true,
					postLikes: {
						select: {
							userID: true,
							postID: true,
						},
					},
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
				select: {
					password: false,
					image: true,
					name: true,
					email: true,
					preferences: true,
				},
			},
		},
	});

	// to preserve type when data is changed to json string and back
	const data = { postData, posterData, commentData };
	type Props = typeof data;

	return {
		props: {
			posterData,
			postData: JSON.parse(JSON.stringify(postData)),
			commentData: JSON.parse(JSON.stringify(commentData)),
			fallback: false,
		} as Props,
		revalidate: 10,
	};
};

export default PostPage;

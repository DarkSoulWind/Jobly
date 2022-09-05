import React, { FC, RefObject, useEffect, useState, Dispatch } from "react";
import {
	FaComment,
	FaEllipsisH,
	FaShare,
	FaThumbsUp,
	FaFlag,
	FaTrash,
} from "react-icons/fa";
import {
	Posts,
	User,
	PostLikes,
	UserPreferences,
	Comments,
} from "@prisma/client";
import Modal from "../modal/Modal";
import { useModal } from "../../hooks/useModal";
import { useRouter } from "next/router";
import { useDate } from "../../hooks/useDate";
import { deleteObject, ref } from "firebase/storage";
import { storage } from "../../firebase-config";
import { Action, FEED_ACTION } from "../../reducers/feedReducer";

type PostWithLikesAndUser =
	| Posts & {
			User: User & {
				preferences: UserPreferences | null;
			};
			PostLikes: PostLikes[];
			Comments: Comments[];
	  };

type UserWithPreferences = User & { preferences: UserPreferences | null };

type PostProps = {
	postData: PostWithLikesAndUser;
	yourData?: UserWithPreferences;
	pageExpanded: boolean;
	commentInputRef?: RefObject<HTMLInputElement>;
	// feed dispatch action
	dispatch?: Dispatch<Action>;
};

const Post: FC<PostProps> = ({
	postData,
	yourData,
	pageExpanded,
	commentInputRef,
	dispatch,
}) => {
	const router = useRouter();
	// IS THIS POST LIKED BY YOU
	const [postLiked, setPostLiked] = useState<boolean>(
		postData?.PostLikes?.filter((like) => like.UserID === yourData?.id)
			.length > 0 || false
	);

	// WHEN THE POST WAS POSTED RELATIVE TO TODAY
	const relativeDatePosted = useDate(new Date(postData.DatePosted));

	const [likedButtonLoading, setLikeButtonLoading] = useState(false);

	// CONFIRM DELETE MODAL
	const [confirmDeleteOpen, setConfirmDeleteOpen, toggleConfirmDelete] =
		useModal(false);

	// CHECK IF THIS POST IS LIKED BY YOU OR NOT
	useEffect(() => {
		setPostLiked(
			postData?.PostLikes?.filter((like) => like.UserID === yourData?.id)
				.length > 0
		);
		console.log("post liked:", postLiked);
	}, [yourData]);

	const likePost = async () => {
		const UserID = yourData?.id;
		const PostID = postData?.PostID;
		setLikeButtonLoading(true);

		// LIKE POST IF POST HASNT BEEN LIKED
		if (!postLiked) {
			try {
				const response = await fetch(
					"http://localhost:3000/api/post-likes/add",
					{
						method: "POST",
						body: JSON.stringify({ UserID, PostID }),
					}
				);
				const data: PostLikes = await response.json();

				if (!response.ok) {
					throw new Error(JSON.stringify(data, null, 4));
				}

				//  Add the like to the array and set post liked to true
				console.log("Added a like!");
				postData?.PostLikes.push({ ...data });
				setPostLiked(true);
			} catch (error) {
				console.error(error);
			}
			// ELSE REMOVE THE LIKE
		} else {
			try {
				const response = await fetch(
					"http://localhost:3000/api/post-likes/delete",
					{ method: "POST", body: JSON.stringify({ UserID, PostID }) }
				);
				const data: PostLikes = await response.json();

				if (!response.ok) {
					throw new Error(JSON.stringify(data, null, 4));
				}

				// Remove the like from the array and set post liked to false
				console.log("Deleted a like!");
				postData.PostLikes = postData.PostLikes.filter((post) => {
					post.LikeID !== data.LikeID;
				});
				setPostLiked(false);
			} catch (error) {
				console.error(error);
			}
		}
		setLikeButtonLoading(false);
	};

	const deletePost = async () => {
		const postID = postData?.PostID;
		try {
			console.log("Deleting post...");
			const response = await fetch(
				`http://localhost:3000/api/posts/delete/${postID}`,
				{
					method: "POST",
				}
			);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data);
			}

			if (postData.Image != null) {
				const imageRef = ref(storage, postData.ImageRef as string);
				await deleteObject(imageRef);
				console.log("Deleted image from firebase storage");
			}
			console.log("Deleted post", JSON.stringify(data, null, 4));
			toggleConfirmDelete();

			// if the post is being shown on its own page then redirect to the feed
			if (pageExpanded) router.push("/feed");

			// if the post was deleted from the feed, then remove it from being rendered
			// and display the success message
			if (!pageExpanded && dispatch) {
				dispatch({
					type: FEED_ACTION.REMOVE_POST,
					payload: { postID: postData.PostID },
				});
				dispatch({
					type: FEED_ACTION.SET_SUCCESS_MESSAGE,
					payload: { success: "Removed post." },
				});
			}
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<div className="w-full bg-white shadow-lg shadow-slate-300 rounded-lg overflow-clip border-[1px] border-slate-300">
			<div className="px-4 py-1">
				<div className="flex justify-end items-center mb-1">
					{/* OPTIONS BUTTON */}
					<button className="relative group p-2 rounded-full aspect-square hover:bg-slate-100 transition-all">
						<FaEllipsisH />

						{/* OPTIONS DROPDOWN MENU */}
						<div className="absolute w-[20rem] top-8 overflow-clip right-0 hidden shadow-sm shadow-slate-500 group-focus-within:block bg-slate-100 border-[1px] border-slate-200 rounded-lg">
							<div className="flex gap-2 flex-col justify-start items-start w-full">
								{/* REPORT POSTS BUTTON */}
								{postData?.User?.name !== yourData?.name && (
									<button className="w-full gap-4 flex items-center justify-start px-4 py-1 hover:bg-slate-200">
										<FaFlag className="aspect-square w-6 h-6" />
										<div className="w-full text-left text-sm">
											<h5 className="font-bold">
												Report
											</h5>
											<p>
												This post is offensive or the
												account is hacked
											</p>
										</div>
									</button>
								)}

								{/* DELETE POST BUTTON */}
								{postData?.User?.name === yourData?.name && (
									<button
										onClick={toggleConfirmDelete}
										className="w-full gap-4 flex items-center justify-start px-4 py-1 hover:bg-slate-200"
									>
										<FaTrash className="aspect-square w-6 h-6" />
										<div className="w-full text-left text-sm">
											<h5 className="font-bold">
												Delete post
											</h5>
											<p>
												Remove the post from your
												timeline
											</p>
										</div>
									</button>
								)}
							</div>
						</div>
					</button>
				</div>
				<hr />
				<div className="flex mt-3 justify-start items-center w-full gap-2">
					<div className="aspect-square rounded-full p-[0.15rem] bg-gradient-to-br from-blue-500 to-violet-500">
						{/* USER PFP */}
						<img
							src={postData?.User?.image ?? ""}
							className="aspect-square border-2 bg-white border-white w-14 rounded-full"
							alt={`${postData?.User?.name} PFP`}
							onError={(e) => {
								e.preventDefault();
								console.log("ERROR LOADING IMAGE");
								e.currentTarget.onerror = null;
								e.currentTarget.classList.add("animate-pulse");
								e.currentTarget.src =
									"https://i.pinimg.com/736x/dd/f0/11/ddf0110aa19f445687b737679eec9cb2.jpg";
							}}
						/>
					</div>

					{/* USERNAME AND DATE POSTED */}
					<div className="w-full text-sm">
						<h4
							className="font-bold cursor-pointer hover:underline"
							onClick={() =>
								router.push(`/user/${postData?.User?.name}`)
							}
						>
							{postData?.User?.name}
						</h4>
						<p>{relativeDatePosted}</p>
					</div>

					{yourData?.name != postData?.User?.name && pageExpanded && (
						<div className="px-3 py-1 cursor-pointer hover:bg-blue-100 rounded-lg transition-all">
							<button className="text-blue-500 font-semibold">
								+&nbsp;Follow
							</button>
						</div>
					)}
				</div>

				<p className="mt-2">{postData?.PostText}</p>
			</div>

			{/* POST IMAGE */}
			<img
				src={postData?.Image ?? ""}
				loading="lazy"
				className="w-full"
				alt=""
			/>

			{/* LIKE AND COMMENT COUNT */}
			<div className="px-3">
				<div className="flex justify-between items-center text-xs py-1">
					<button className="hover:text-blue-500 hover:underline">
						<p>
							{postData?.PostLikes?.length ?? "0"}{" "}
							{postData.PostLikes?.length === 1
								? "like"
								: "likes"}
						</p>
					</button>
					<button className="hover:text-blue-500 hover:underline">
						<p>
							{postData.Comments?.length ?? "0"}{" "}
							{postData.Comments?.length === 1
								? "comment"
								: "comments"}
						</p>
					</button>
				</div>
				<hr />
			</div>

			<div className="flex justify-around items-center py-1 px-3">
				{/* LIKE BUTTON */}
				<button
					onClick={likePost}
					disabled={likedButtonLoading}
					className="flex items-center hover:bg-slate-100 disabled:bg-slate-100 transition-all rounded-lg gap-1 py-2 px-8"
				>
					<FaThumbsUp
						className={`${
							postLiked ? "fill-blue-500" : "fill-slate-500"
						}`}
					/>
					<p
						className={`font-semibold ${
							postLiked ? "text-blue-500" : "text-slate-500"
						}`}
					>
						{postLiked ? "Liked" : "Like"}
					</p>
				</button>

				{/* COMMENT BUTTON */}
				<button
					onClick={() => {
						if (!pageExpanded) {
							router.push(`/post/${postData?.PostID}`);
						} else {
							console.log("lol");
							commentInputRef?.current?.focus();
						}
					}}
					className="flex items-center hover:bg-slate-100 transition-all rounded-lg gap-1 py-2 px-8"
				>
					<FaComment className="fill-slate-500" />
					<p className="text-slate-500 font-semibold">Comment</p>
				</button>
				{/* SHARE BUTTON */}
				<button className="flex items-center hover:bg-slate-100 transition-all rounded-lg gap-1 py-2 px-8">
					<FaShare className="fill-slate-500" />
					<p className="text-slate-500 font-semibold">Share</p>
				</button>
			</div>
			{/* CONFIRM DELETE MODAL */}
			<Modal
				open={confirmDeleteOpen as boolean}
				title="Are you sure?"
				confirmButton="Delete"
				confirmButtonAction={deletePost}
				confirmButtonColour="bg-red-500 hover:bg-red-700"
				discardButton="Cancel"
				discardButtonAction={toggleConfirmDelete}
				discardButtonColour="bg-blue-500 hover:bg-blue-700"
			>
				<p className="font-bold">
					This will permanently delete your post forever.
				</p>
			</Modal>
		</div>
	);
};

export default Post;

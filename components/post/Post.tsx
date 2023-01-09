import React, {
	FC,
	RefObject,
	useEffect,
	useState,
	Dispatch,
	Fragment,
	SetStateAction,
} from "react";
import { FaComment, FaEllipsisH, FaShare, FaThumbsUp } from "react-icons/fa";
import { Post, User, PostLike, UserPreference, Comment } from "@prisma/client";
import Modal from "@components/modal/Modal";
import { useModal } from "@lib/hooks/useModal";
import { useRouter } from "next/router";
import { useDate } from "@lib/hooks/useDate";
import { deleteObject, ref } from "firebase/storage";
import { storage } from "../../firebase-config";
import { Action as FeedAction, FEED_ACTION } from "@lib/reducers/feedReducer";
import { AnimatePresence } from "framer-motion";
import { Menu, Transition } from "@headlessui/react";
import { HiFlag, HiTrash } from "react-icons/hi";
import { useMutation, useQueryClient } from "react-query";
import usePostLiked from "@lib/hooks/usePostLiked";
import Markdown from "@components/markdown/Markdown";
import { PRODUCTION_URL } from "@lib/url";

type PostWithLikesAndUser =
	| Post & {
			user: User & {
				preferences: UserPreference | null;
			};
			comments: Comment[];
			postLikes: PostLike[];
	  };

type UserWithPreferences = User & { preferences: UserPreference | null };

interface PostProps {
	postData: PostWithLikesAndUser;
	yourData?: UserWithPreferences;
	commentInputRef?: RefObject<HTMLInputElement>;
	// feed dispatch action
	dispatch?: Dispatch<FeedAction>;
	// if the post is being displayed on its own page and not the feed
	pageExpanded: boolean;
}

const Post: FC<PostProps> = ({
	postData,
	yourData,
	commentInputRef,
	dispatch,
	pageExpanded,
}) => {
	const queryClient = useQueryClient();
	const router = useRouter();
	// IS THIS POST LIKED BY YOU
	const [postLiked, setPostLiked] = usePostLiked(
		postData.postLikes,
		yourData?.id ?? ""
	);

	const postLikeMutation = useMutation(
		(data: { userID: string; postID: string; postLiked: boolean }) => {
			return postLiked
				? fetch(`${PRODUCTION_URL}/api/post-likes/delete`, {
						method: "POST",
						body: JSON.stringify({
							userID: data.userID,
							postID: data.postID,
						}),
				  })
				: fetch(`${PRODUCTION_URL}/api/post-likes/add`, {
						method: "POST",
						body: JSON.stringify({
							userID: data.userID,
							postID: data.postID,
						}),
				  });
		},
		{
			onSuccess: () => {
				queryClient.invalidateQueries("posts");
			},
		}
	);

	// WHEN THE POST WAS POSTED RELATIVE TO TODAY
	const relativeDatePosted = useDate(new Date(postData.datePosted));

	const [likedButtonLoading, setLikeButtonLoading] = useState(false);

	// CONFIRM DELETE MODAL
	const [confirmDeleteOpen, setConfirmDeleteOpen, toggleConfirmDelete] =
		useModal(false);

	const likePost = async () => {
		// console.log(
		// 	"your data before delete",
		// 	JSON.stringify(yourData, null, 4)
		// );
		const userID = yourData!.id;
		const postID = postData?.id;
		setLikeButtonLoading(true);

		postLikeMutation.mutate({ userID, postID, postLiked });
		// if post is being liked (wasn't liked before)
		if (!postLiked) {
			postData.postLikes = [
				...(postData.postLikes ?? []),
				{ userID, postID },
			];
			setPostLiked(true);
			// if post was alread liked (disliking)
		} else {
			postData.postLikes = postData.postLikes.filter(
				(postLike) =>
					postLike.postID !== postID && postLike.userID !== userID
			);
			setPostLiked(false);
		}
		setLikeButtonLoading(false);
	};

	const deletePost = async () => {
		const postID = postData?.id;
		try {
			console.log("Deleting post...");
			const response = await fetch(
				`${PRODUCTION_URL}/api/posts/delete/${postID}`,
				{
					method: "POST",
				}
			);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data);
			}

			if (postData.image != null) {
				const imageRef = ref(storage, postData.imageRef as string);
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
				// dispatch({
				// 	type: FEED_ACTION.REMOVE_POST,
				// 	payload: { postID: postData.id },
				// });
				queryClient.invalidateQueries("posts");

				dispatch({
					type: FEED_ACTION.SET_SUCCESS_MESSAGE,
					payload: { success: "Post removed successfully!" },
				});
			}
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<div className="w-full bg-white shadow-sm shadow-slate-300 rounded-lg overflow-clip border-[1px] border-slate-300">
			<div className="px-4 py-1">
				<div className="relative flex justify-end items-center mb-1">
					<Menu>
						<Menu.Button className="relative group p-2 rounded-full aspect-square hover:bg-slate-100 transition-all">
							<FaEllipsisH />
						</Menu.Button>

						<Transition
							as={Fragment}
							enter="transition ease-out duration-100"
							enterFrom="transform opacity-0 scale-95"
							enterTo="transform opacity-100 scale-100"
							leave="transition ease-in duration-75"
							leaveFrom="transform opacity-100 scale-100"
							leaveTo="transform opacity-0 scale-95"
						>
							<Menu.Items className="absolute top-5 mt-1 w-56 divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
								<div className="p-1">
									{postData.user.name === yourData?.name && (
										<Menu.Item>
											{({ active }) => (
												<button
													onClick={
														toggleConfirmDelete
													}
													className={`${
														active
															? "bg-violet-500 text-white"
															: "text-gray-900"
													} group flex gap-2 w-full items-center transition-all duration-300 rounded-md px-2 py-2 text-sm`}
												>
													<HiTrash
														className={`w-5 h-5 ${
															active
																? "fill-white"
																: "fill-red-500"
														}`}
													/>
													<p
														className={`font-bold ${
															active
																? "text-white"
																: "text-red-500 "
														}`}
													>
														Delete
													</p>
												</button>
											)}
										</Menu.Item>
									)}

									{postData?.user?.name !==
										yourData?.name && (
										<Menu.Item>
											{({ active }) => (
												<button
													className={`${
														active
															? "bg-violet-500 text-white"
															: "text-gray-900"
													} group flex gap-2 w-full items-center transition-all duration-300 rounded-md px-2 py-2 text-sm`}
												>
													<HiFlag className="w-5 h-5" />
													<p className={`font-bold`}>
														Report
													</p>
												</button>
											)}
										</Menu.Item>
									)}
								</div>
							</Menu.Items>
						</Transition>
					</Menu>
				</div>
				<hr />
				<div className="flex mt-3 justify-start items-center w-full gap-2">
					<div className="aspect-square rounded-full p-[0.15rem] bg-gradient-to-br from-blue-500 to-violet-500">
						{/* USER PFP */}
						<img
							src={postData?.user?.image ?? ""}
							className="aspect-square border-2 bg-white border-white w-14 rounded-full"
							alt={`${postData?.user?.name} PFP`}
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
								router.push(`/user/${postData?.user?.name}`)
							}
						>
							{postData?.user?.name}
						</h4>
						<p>{relativeDatePosted}</p>
					</div>

					{yourData?.name != postData?.user?.name && pageExpanded && (
						<div className="px-3 py-1 cursor-pointer hover:bg-blue-100 rounded-lg transition-all">
							<button className="text-blue-500 font-semibold">
								+&nbsp;Follow
							</button>
						</div>
					)}
				</div>

				{/* POST TEXT */}
				<Markdown className="mt-2">{postData.postText}</Markdown>
			</div>

			{/* POST IMAGE */}
			<img
				src={postData?.image ?? ""}
				loading="lazy"
				className="w-full"
				alt=""
			/>

			{/* LIKE AND COMMENT COUNT */}
			<div className="px-3">
				<div className="flex justify-between items-center text-xs py-1">
					<button className="hover:text-blue-500 hover:underline">
						<p>
							{postData?.postLikes?.length ?? "0"}{" "}
							{postData.postLikes?.length === 1
								? "like"
								: "likes"}
						</p>
					</button>
					<button className="hover:text-blue-500 hover:underline">
						<p>
							{postData.comments?.length ?? "0"}{" "}
							{postData.comments?.length === 1
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
							router.push(`/post/${postData?.id}`);
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
			<AnimatePresence
				initial={false}
				mode="wait"
				onExitComplete={() => null}
			>
				{confirmDeleteOpen && (
					<Modal
						open={confirmDeleteOpen}
						title="Are you sure?"
						confirmButton="Delete"
						confirmButtonAction={deletePost}
						confirmButtonColour="bg-red-500 hover:bg-red-700"
						discardButton="Cancel"
						discardButtonAction={toggleConfirmDelete}
						discardButtonColour="bg-blue-500 hover:bg-blue-700"
					>
						<p className="font-bold">
							This will permanently delete your post.
						</p>
					</Modal>
				)}
			</AnimatePresence>
		</div>
	);
};

export default Post;

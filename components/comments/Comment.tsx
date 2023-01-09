import { FC, Fragment, Dispatch, SetStateAction } from "react";
import { Comment, Follow, UserPreference } from "@prisma/client";
import { FaEllipsisH } from "react-icons/fa";
import { useModal } from "@lib/hooks/useModal";
import Modal from "@components/modal/Modal";
import { useRouter } from "next/router";
import { useDate } from "@lib/hooks/useDate";
import { AnimatePresence } from "framer-motion";
import { Menu, Transition } from "@headlessui/react";
import { HiFlag, HiTrash } from "react-icons/hi";
import Markdown from "@components/markdown/Markdown";
import { PRODUCTION_URL } from "@lib/url";

interface CommentProps {
	commentData: Comment & {
		user: {
			image: string | null;
			name: string;
			email: string | null;
			preferences: UserPreference | null;
		};
	};
	yourData?: {
		image: string | null;
		name: string;
		preferences: UserPreference | null;
		id: string;
		following: Follow[];
		followers: Follow[];
	} | null;
	setComments: Dispatch<
		SetStateAction<
			(Comment & {
				user: {
					name: string;
					image: string | null;
					preferences: UserPreference | null;
					email: string | null;
				};
			})[]
		>
	>;
	setStatus: Dispatch<
		SetStateAction<{
			success: string;
			error: string;
		}>
	>;
	isAuthor: boolean;
}

const Comment: FC<CommentProps> = ({
	commentData,
	isAuthor,
	yourData,
	setComments,
	setStatus,
}) => {
	const router = useRouter();

	// WHEN THE COMMENT WAS POSTED RELATIVE TO TODAY
	const relativeDatePosted = useDate(new Date(commentData.datePosted));

	// CONFIRM DELETE MODAL
	const [confirmDeleteOpen, setConfirmDeleteOpen, toggleConfirmDelete] =
		useModal(false);

	const deleteComment = async () => {
		const id = commentData.id;
		try {
			console.log("Deleting comment...");
			const response = await fetch(
				`${PRODUCTION_URL}/api/comments/delete`,
				{
					method: "POST",
					body: JSON.stringify({ id }),
				}
			);
			const data: Comment & {
				user: {
					image: string | null;
					name: string;
					email: string | null;
					preferences: UserPreference | null;
				};
			} = await response.json();

			if (!response.ok) {
				throw new Error(JSON.stringify(data, null, 4));
			}

			setComments((comments) =>
				comments.filter((comment) => comment.id !== data.id)
			);
			setStatus({ success: "Comment deleted!", error: "" });
			toggleConfirmDelete();
		} catch (error) {
			console.error(error);
			setStatus({ success: "", error: "Failed to delete comment." });
		}
	};

	return (
		<div className="relative w-full flex items-start justify-start gap-2">
			<img
				src={commentData.user.image ?? ""}
				className="w-12 rounded-full aspect-square"
				onError={(e) => {
					e.preventDefault();
					console.log("ERROR LOADING IMAGE");
					e.currentTarget.onerror = null;
					e.currentTarget.classList.add("animate-pulse");
					e.currentTarget.src =
						"https://i.pinimg.com/736x/dd/f0/11/ddf0110aa19f445687b737679eec9cb2.jpg";
				}}
				alt="PFP"
			/>
			<div className="w-full bg-slate-200 p-2 rounded-lg text-sm">
				{/* COMMENT AUTHOR */}
				<h3 className="font-bold">
					<a
						className="hover:underline cursor-pointer"
						onClick={() =>
							router.push(`/user/${commentData.user.name}`)
						}
					>
						{commentData.user.preferences?.firstName ??
							commentData.user.name}{" "}
						{commentData.user.preferences?.firstName
							? commentData.user.preferences?.lastName
							: ""}
					</a>
					{commentData.user.preferences?.pronouns && (
						<span className="font-normal text-slate-600">
							{" "}
							({commentData.user.preferences.pronouns})
						</span>
					)}{" "}
					{/* CHECKS IF THEY ARE OP */}
					{isAuthor && (
						<span className="bg-slate-600 px-2 font-semibold text-white rounded-md">
							Author
						</span>
					)}
				</h3>
				<h4 className="text-xs text-slate-600">
					{commentData.user.preferences?.bio}
				</h4>

				{/* COMMENT TEXT */}
				<Markdown className="mt-2">{commentData.commentText}</Markdown>
			</div>
			<div className="absolute top-1 right-3 flex justify-end items-center gap-1">
				<p className="text-xs text-slate-600">{relativeDatePosted}</p>
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
								{/* DELETE BUTTON */}
								{commentData.user.name === yourData?.name && (
									<Menu.Item>
										{({ active }) => (
											<button
												onClick={toggleConfirmDelete}
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

								{/* REPORT BUTTON */}
								{commentData.user.name !== yourData?.name && (
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
						confirmButtonAction={deleteComment}
						confirmButtonColour="bg-red-500 hover:bg-red-700"
						discardButton="Cancel"
						discardButtonAction={toggleConfirmDelete}
						discardButtonColour="bg-blue-500 hover:bg-blue-700"
					>
						<p className="font-bold">
							This will permanently delete your post forever.
						</p>
					</Modal>
				)}
			</AnimatePresence>
			{/* CONFIRM DELETE MODAL */}
		</div>
	);
};

export default Comment;

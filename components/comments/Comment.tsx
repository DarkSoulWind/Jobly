import React, { FC } from "react";
import { Comments, User, UserPreferences } from "@prisma/client";
import { FaEllipsisH, FaFlag, FaTrash } from "react-icons/fa";
import { useModal } from "../../hooks/useModal";
import Modal from "../modal/Modal";
import { useRouter } from "next/router";
import { useDate } from "../../hooks/useDate";
import { AnimatePresence } from "framer-motion";

type UserWithPreferences = User & { preferences: UserPreferences | null };

type CommentProps = {
	commentData: Comments & {
		User: User & {
			preferences: UserPreferences | null;
		};
	};
	yourData?: UserWithPreferences | null;
	author: boolean;
};

const Comment: FC<CommentProps> = ({ commentData, author, yourData }) => {
	const router = useRouter();

	// WHEN THE COMMENT WAS POSTED RELATIVE TO TODAY
	const relativeDatePosted = useDate(new Date(commentData.DatePosted));

	// CONFIRM DELETE MODAL
	const [confirmDeleteOpen, setConfirmDeleteOpen, toggleConfirmDelete] =
		useModal(false);

	const deleteComment = async () => {
		const CommentID = commentData.CommentID;
		try {
			console.log("Deleting comment...");
			const response = await fetch(
				`http://localhost:3000/api/comments/delete`,
				{
					method: "POST",
					body: JSON.stringify({ CommentID }),
				}
			);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data);
			}

			console.log("Deleted comment", JSON.stringify(data, null, 4));
			toggleConfirmDelete();
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<div className="relative w-full flex items-start justify-start gap-2">
			<img
				src={commentData.User.image ?? ""}
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
							router.push(`/user/${commentData.User.name}`)
						}
					>
						{commentData.User.preferences?.FirstName ??
							commentData.User.name}{" "}
						{commentData.User.preferences?.FirstName
							? commentData.User.preferences?.LastName
							: ""}
					</a>
					{commentData.User.preferences?.Pronouns && (
						<span className="font-normal text-slate-600">
							{" "}
							({commentData.User.preferences.Pronouns})
						</span>
					)}{" "}
					{/* CHECKS IF THEY ARE OP */}
					{author && (
						<span className="bg-slate-600 px-2 font-semibold text-white rounded-md">
							Author
						</span>
					)}
				</h3>
				<h4 className="text-xs text-slate-600">
					{commentData.User.preferences?.Bio}
				</h4>
				<p className="mt-2">{commentData.CommentText}</p>
			</div>
			<div className="absolute top-1 right-3 flex justify-end items-center gap-1">
				<p className="text-xs text-slate-600">{relativeDatePosted}</p>
				<button className="relative group p-2 rounded-full aspect-square hover:bg-slate-300 transition-all">
					<FaEllipsisH className="fill-slate-600" />
					{/* DROPDOWN MENU */}
					<div className="absolute z-10 w-[20rem] top-8 overflow-clip right-0 hidden shadow-sm shadow-slate-500 group-focus-within:block bg-slate-100 border-[1px] border-slate-200 rounded-lg">
						<div className="flex gap-2 flex-col justify-start items-start w-full">
							{/* REPORT POSTS BUTTON */}
							{commentData.User.name !== yourData?.name && (
								<button className="w-full gap-4 flex items-center justify-start px-4 py-1 hover:bg-slate-200">
									<FaFlag className="aspect-square w-6 h-6" />
									<div className="w-full text-left text-sm">
										<h5 className="font-bold">Report</h5>
										<p>
											This comment is offensive or the
											account is hacked
										</p>
									</div>
								</button>
							)}
							{/* DELETE POST BUTTON */}
							{commentData.User.name === yourData?.name && (
								<button
									onClick={toggleConfirmDelete}
									className="w-full gap-4 flex items-center justify-start px-4 py-1 hover:bg-slate-200"
								>
									<FaTrash className="aspect-square w-6 h-6" />
									<div className="w-full text-left text-sm">
										<h5 className="font-bold">
											Delete comment
										</h5>
										<p>
											Remove the comment from your
											timeline
										</p>
									</div>
								</button>
							)}
						</div>
					</div>
				</button>
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

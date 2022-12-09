import React, { ChangeEvent, Dispatch, FC, useRef, useState } from "react";
import Modal from "./Modal";
import { User, Post } from "@prisma/client";
import { Action as FeedAction, FEED_ACTION } from "@reducers/feedReducer";
import { FaHashtag, FaImage, FaTimesCircle } from "react-icons/fa";
import { useRouter } from "next/router";
import { getDownloadURL, ref, StorageReference } from "firebase/storage";
import { useUploadFile } from "react-firebase-hooks/storage";
import { v4 as uuid } from "uuid";
import { storage } from "../../firebase-config";
import { z } from "zod";
import { useMutation, useQueryClient } from "react-query";

type CreatePostModalProps = {
	modalOpen: boolean;
	toggle: () => void;
	userData?: User;
	dispatch: Dispatch<FeedAction>;
};

const SubmitBody = z
	.string({ required_error: "Post body is empty." })
	.min(10, { message: "Post body must be longer than 10 characters." })
	.max(128, { message: "Post body must be 128 characters or fewer." })
	.trim();

type PostUpload = {
	userID: string;
	postText: string;
	image: string | undefined;
	imageRef: string;
};

const CreatePostModal: FC<CreatePostModalProps> = ({
	modalOpen,
	toggle,
	userData,
	dispatch,
}) => {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [postText, setPostText] = useState("");
	const [selectedImage, setSelectedImage] = useState<{
		src: NamedCurve;
		file?: File;
		name?: string;
	}>({ src: "" });
	const uploadImageRef = useRef<HTMLInputElement>(null);
	const [uploadFile, uploading] = useUploadFile();

	const postUploadMutation = useMutation(
		(post: PostUpload) => {
			return fetch("http://localhost:3000/api/posts/add", {
				method: "POST",
				body: JSON.stringify(post),
			});
		},
		{
			onSuccess: () => {
				queryClient.invalidateQueries("posts");
			},
		}
	);

	// display image that has been submitted from file input
	const onImageChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files) return;

		const file = e.target.files?.[0];
		const fileExtension =
			file?.name.split(".")[file?.name.split(".").length - 1];
		const name = `${uuid()}.${fileExtension}`;
		const blobFile = e.target.files?.[0] as Blob;
		let reader = new FileReader();

		reader.readAsDataURL(blobFile);
		reader.onload = (e) => {
			setSelectedImage({ src: e?.target?.result as string, file, name });
		};
	};

	// upload image to firebase storage bucket and retrieve download url
	const uploadImage = async (): Promise<string | undefined> => {
		if (selectedImage.src === "") return;
		return new Promise<string>(async (resolve, reject) => {
			// the location where the file will be uploaded to
			const storageRef = ref(
				storage,
				`post_photos/${selectedImage.name}`
			);
			await uploadFile(storageRef, selectedImage.file as Blob)
				.then(async (result) => {
					console.log(
						"upload results",
						JSON.stringify(result, null, 4)
					);
					await getDownloadURL(result?.ref as StorageReference)
						.then((url) => {
							console.log("The image is at url", url);
							resolve(url);
						})
						.catch((error) => {
							reject(error);
						});
				})
				.catch((error) => {
					reject(error);
				});
		});
	};

	// when posting the post
	const handleSubmit = async () => {
		const validResults = SubmitBody.safeParse(postText.trim());
		console.log("VALIDATION RESULTS", validResults);

		if (!validResults.success) {
			const formatted = validResults.error.format();
			console.log(formatted);
			dispatch({
				type: FEED_ACTION.SET_ERROR_MESSAGE,
				payload: { error: formatted._errors[0] },
			});
			return;
		}

		const image = await uploadImage();
		const imageRef = `post_photos/${selectedImage.name}`;
		const body = {
			userID: userData!.id,
			postText: postText.trim(),
			image,
			imageRef,
		};

		try {
			console.log("Posting...");
			postUploadMutation.mutate(body);
			console.log("Posted successfully!");
			toggle();
			dispatch({
				type: FEED_ACTION.SET_SUCCESS_MESSAGE,
				payload: { success: "Posted successfully!" },
			});
		} catch (error) {
			dispatch({
				type: FEED_ACTION.SET_ERROR_MESSAGE,
				payload: { error: "Post failed." },
			});
			console.error(error);
		}
	};

	return (
		<Modal
			open={modalOpen}
			confirmButton="Post"
			confirmButtonAction={handleSubmit}
			confirmButtonDisabled={uploading}
			confirmButtonDisabledText="Uploading..."
			discardButton="Cancel"
			discardButtonAction={toggle}
			title="Create a post"
		>
			<div>
				<div className="flex justify-start items-start gap-2 px-4 w-full">
					<img
						className="aspect-square rounded-full w-14 h-14"
						src={userData?.image ?? ""}
						alt="pfp"
						onError={(e) => {
							e.preventDefault();
							console.log("ERROR LOADING IMAGE");
							e.currentTarget.onerror = null;
							e.currentTarget.classList.add("animate-pulse");
							e.currentTarget.src =
								"https://i.pinimg.com/736x/dd/f0/11/ddf0110aa19f445687b737679eec9cb2.jpg";
						}}
					/>
					<h5 className="text-black font-semibold">
						{userData?.name}
					</h5>
				</div>
				<textarea
					placeholder="What's happening?"
					value={postText}
					onChange={(e) => setPostText(e.target.value)}
					className="w-full max-h-[10rem] text-2xl mt-4 px-4 outline-none placeholder:text-gray-600 resize-none"
				></textarea>

				{/* SELECTED IMAGE */}
				{selectedImage.src != "" && (
					<div className="px-3 relative w-fit">
						<img
							src={selectedImage.src}
							className="max-w-[200px] max-h-[200px] rounded-xl"
							alt="Selected image"
						/>
						<button
							onClick={() => {
								setSelectedImage({ src: "" });
								uploadImageRef.current!.value = "";
								uploadImageRef.current!.files = null;
							}}
							className="absolute group -top-1 right-1"
						>
							<FaTimesCircle className="w-5 h-5 bg-white rounded-full hover:opacity-70" />
							<p className="absolute text-sm w-[7rem] -top-8 scale-0 group-hover:scale-100 transition-all duration-150 ease-in-out -right-[3rem] py-1 px-1 border-[1px] border-slate-200 rounded-lg bg-white shadow-md shadow-gray-700">
								Remove photo
							</p>
						</button>
					</div>
				)}

				{/* BOTTOM BUTTONS */}
				<div className="flex flex-start items-center mt-3 px-1">
					{/* HASHTAG BUTTON */}
					<button className="group relative aspect-square rounded-full p-3 hover:bg-slate-100 transition-all">
						<FaHashtag className="w-5 h-5 fill-slate-600" />
						{/* HOVER TOOLTIP */}
						<p className="absolute text-sm w-[7rem] -top-5 scale-0 group-hover:scale-100 transition-all duration-150 ease-in-out -right-10 py-1 px-1 border-[1px] border-slate-200 rounded-lg bg-white shadow-md shadow-gray-700">
							Add hashtag
						</p>
					</button>

					{/* UPLOAD FILES BUTTON (only accessible by ref, hidden from dom) */}
					<input
						type="file"
						className="hidden"
						ref={uploadImageRef}
						onChange={onImageChange}
					/>

					{/* UPLOAD PHOTO BUTTON */}
					<button
						onClick={() => {
							uploadImageRef.current?.click();
						}}
						className="group relative aspect-square rounded-full p-3 hover:bg-slate-100 transition-all"
					>
						<FaImage className="w-5 h-5 fill-slate-600" />
						{/* HOVER TOOLTIP */}
						<p className="absolute text-sm w-[7rem] -top-5 scale-0 group-hover:scale-100 transition-all duration-150 ease-in-out -right-10 py-1 px-1 border-[1px] border-slate-200 rounded-lg bg-white shadow-md shadow-gray-700">
							Add a photo
						</p>
					</button>

					<p
						className={`${
							SubmitBody.safeParse(postText.trim()).success
								? "text-green-500"
								: "text-red-500"
						} px-3`}
					>
						{postText.trim().length}/128
					</p>
				</div>
			</div>
		</Modal>
	);
};

export default CreatePostModal;

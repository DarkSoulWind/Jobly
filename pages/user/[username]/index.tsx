import type { NextPage, GetStaticPropsContext } from "next";
import React, { useState, useEffect, useReducer } from "react";
import { v4 as uuid } from "uuid";
import Head from "next/head";
import Navbar from "../../../components/nav/Navbar";
import Footer from "../../../components/footer/Footer";
import { FaCamera, FaEnvelope, FaLocationArrow } from "react-icons/fa";
import { useModal } from "../../../hooks/useModal";
import EditProfileModal from "../../../components/modal/EditProfileModal";
import ContactDetailModal from "../../../components/modal/ContactDetailModal";
import { prisma } from "../../../lib/prisma";
import {
	User,
	Comments,
	UserPreferences,
	Posts,
	Follows,
	Interests,
} from "@prisma/client";
import {
	UserProfile,
	profileReducer,
	ProfileState,
	PROFILE_ACTION,
} from "../../../reducers/profileReducer";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useDate } from "../../../hooks/useDate";
import { AnimatePresence, motion, Variants } from "framer-motion";
import Modal from "../../../components/modal/Modal";
import Alert from "../../../components/alert/Alert";
import FollowersModal from "../../../components/modal/FollowersModal";

interface UserProfileProps {
	profile: UserProfile;
}

type UserPreferencesFollows =
	| (User & {
			preferences: UserPreferences;
			followers: Follows[];
			following: Follows[];
	  })
	| null;

type FollowResponse = {
	follower: User;
	followerId: string;
};

// INITIALISER FOR GLOBAL STATE FOR THIS COMPONENT
export const initProfileState = ({
	profile,
}: {
	profile: UserProfile;
}): ProfileState => {
	return {
		profile,
		isFollowing: false,
		successMessage: "",
	};
};

const UserProfile: NextPage<UserProfileProps> = ({ profile }) => {
	const router = useRouter();
	const { data } = useSession();
	// console.log("PROFILE DATA:", JSON.stringify(profile, null, 4));

	const [profileState, dispatch] = useReducer(
		profileReducer,
		{ profile },
		initProfileState
	);

	const activities = [...profile.Comments, ...profile.posts]
		.sort((a, b) => {
			if (a.DatePosted < b.DatePosted) return 1;
			else if (a.DatePosted > b.DatePosted) return -1;
			else return 0;
		})
		.slice(0, 5);

	// Your user data
	const [yourData, setYourData] = useState<UserPreferencesFollows>();

	// Checks if the follow button should be loading
	const [followButtonLoading, setFollowButtonLoading] = useState(false);

	// MODALS
	const [
		editProfileModalOpen,
		setEditProfileModalOpen,
		toggleEditProfileModal,
	] = useModal(false);
	const [contactModalOpen, setContactModalOpen, toggleContactModal] =
		useModal(false);
	const [followersModalOpen, setFollowersModalOpen, toggleFollowersModal] =
		useModal(false);

	// ALERTS
	const [successMessage, setSuccessMessage] = useState(
		"Profile changed successfully."
	);

	// Fetch your data if your email and the profile email do not match
	useEffect(() => {
		const abortController = new AbortController();

		const getUserByEmail = async () => {
			if (data?.user?.email !== profileState.profile.email) {
				console.log("Fetching your data...");
				const response = await fetch(
					`http://localhost:3000/api/user/email/${data?.user?.email}`,
					{ signal: abortController.signal }
				);
				const responseData: UserPreferencesFollows =
					await response.json();
				console.log(
					"YOUR DATA:",
					JSON.stringify(responseData, null, 4)
				);
				setYourData(responseData);

				const isFollowing =
					profileState.profile.followers.filter(
						(follow) => follow.followerId === responseData?.id
					).length > 0;
				console.log("Following:", isFollowing);
				// set is following
				dispatch({
					type: PROFILE_ACTION.SET_IS_FOLLOWING,
					payload: {
						isFollowing,
					},
				});
			}
		};

		getUserByEmail();

		return () => {
			abortController.abort();
		};
	}, [data]);

	const handleFollow = async () => {
		setFollowButtonLoading(true);
		const body = {
			followerId: yourData?.id,
			followingId: profileState.profile.id,
		};
		// if not following, create a new follow
		console.log("Are you following tho?", profileState.isFollowing);
		if (!profileState.isFollowing) {
			try {
				const response = await fetch(
					"http://localhost:3000/api/follows/add",
					{
						method: "POST",
						body: JSON.stringify(body),
					}
				);
				const data: FollowResponse = await response.json();

				if (!response.ok) {
					throw new Error(JSON.stringify(data, null, 4));
				}
				console.log("Followed!", JSON.stringify(data, null, 2));
				dispatch({
					type: PROFILE_ACTION.SET_IS_FOLLOWING,
					payload: {
						isFollowing: true,
						follow: { action: "add", data },
					},
				});
			} catch (error) {
				console.error(error);
			}
		} // but if they are then remove that follow
		else {
			try {
				const response = await fetch(
					"http://localhost:3000/api/follows/delete",
					{
						method: "POST",
						body: JSON.stringify(body),
					}
				);
				const data: FollowResponse = await response.json();

				if (!response.ok) {
					throw new Error(JSON.stringify(data, null, 4));
				}
				console.log("Unfollowed!", JSON.stringify(data, null, 4));
				dispatch({
					type: PROFILE_ACTION.SET_IS_FOLLOWING,
					payload: {
						isFollowing: false,
						follow: { action: "remove", data },
					},
				});
			} catch (error) {
				console.error(error);
			}
		}
		setFollowButtonLoading(false);
	};

	const handleChatButton = async () => {
		const body = { userid1: yourData?.id, userid2: profile.id };
		const response = await fetch(
			"http://localhost:3000/api/chats/findSharedPriv",
			{ method: "POST", body: JSON.stringify(body) }
		);
		const data: { exists: boolean; chatid?: string } =
			await response.json();
		console.log("do you two share a chat?", data.exists);

		// if they dont share a chat, create a new one with them as participants
		if (!data.exists) {
			const newChatID = uuid();
			const chatname = `${yourData?.name} and ${profile.name}`;
			await fetch("http://localhost:3000/api/chats/create", {
				method: "POST",
				body: JSON.stringify({
					chatid: newChatID,
					chatname,
					participants: [
						{ userid: yourData?.id },
						{ userid: profile.id },
					],
				}),
			})
				.then((response) => {
					console.log(
						"created chat with participants",
						JSON.stringify(response, null, 4)
					);
					router.push({
						pathname: "/direct",
						query: { chat: newChatID },
					});
				})
				.catch((error) => {
					console.error(error);
				});
		}
		router.push({ pathname: "/direct", query: { chat: data.chatid } });
	};

	return (
		<>
			<Head>
				<title>{profileState.profile.name} • Jobly</title>
				<meta
					name="description"
					content={`Jobly profile for ${profileState.profile.name}`}
				/>
			</Head>
			<Navbar />
			<div className="background"></div>

			<AnimatePresence
				initial={false}
				mode="wait"
				onExitComplete={() => null}
			>
				{profileState.successMessage !== "" && (
					<Alert
						level="Success"
						message={profileState.successMessage}
						open={profileState.successMessage !== ""}
						closeAction={() =>
							dispatch({
								type: PROFILE_ACTION.SET_SUCCESS_MESSAGE,
								payload: { successMessage: "" },
							})
						}
					/>
				)}
			</AnimatePresence>

			<div className="w-full pt-[4.25rem] px-5 grid gap-3 grid-cols-2">
				{/* PROFILE CARD */}
				<section className="grid grid-cols-1 rounded-xl overflow-clip col-span-2 xl:col-span-1">
					{/* BANNER */}
					<div className="relative">
						<img
							src={
								profileState.profile.preferences?.Banner ??
								"https://swall.teahub.io/photos/small/303-3034192_default-banner-banner-jpg.jpg"
							}
							className="w-full h-full"
							alt="profile banner"
						/>
						{data?.user?.name === profileState.profile.name && (
							<button className="absolute group bg-white rounded-full p-3 top-3 right-3">
								<FaCamera className="aspect-square fill-blue-500 group-hover:fill-blue-800 transition-all w-7 h-7" />
							</button>
						)}
					</div>
					<div className="bg-white relative rounded-b-xl p-5">
						<div className="absolute -top-36">
							{/* PROFILE PIC */}
							<img
								src={profileState.profile.image ?? ""}
								className="aspect-square top-0 rounded-full w-48 border-[4px] border-white"
								alt={`${profileState.profile.image} pfp`}
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
						<div className="mt-10">
							{/* FIRST AND LAST NAME */}
							<div className="flex justify-start items-center gap-2">
								<h2 className="font-extrabold text-2xl">
									{`${
										profileState.profile.preferences
											?.FirstName ??
										profileState.profile.name
									} ${
										profileState.profile.preferences
											?.LastName ?? ""
									}`}
								</h2>
								{profileState.profile.preferences?.Pronouns && (
									<p className="text-xs bg-slate-200 font-bold p-1 rounded-sm">
										{
											profileState.profile.preferences
												.Pronouns
										}
									</p>
								)}
							</div>
							{/* USERNAME */}
							<p className="font-bold">
								@{profileState.profile.name}
							</p>
							{/* BIO */}
							<h3 className="mt-2">
								{profileState.profile.preferences?.Bio ??
									"Empty bio"}
							</h3>
							{/* LOCATION AND CONTACT INFO BUTTON */}
							<p className="text-sm flex justify-start items-center gap-1 text-slate-500">
								{/* LOCATION ICON */}
								{(profileState.profile.preferences?.City ||
									profileState.profile.preferences
										?.CountryRegion) && <FaLocationArrow />}
								{profileState.profile.preferences?.City
									? `${profileState.profile.preferences?.City}, `
									: ""}
								{profileState.profile.preferences?.CountryRegion
									? `${profileState.profile.preferences?.CountryRegion} • `
									: ""}
								<button
									className="text-blue-500 hover:underline"
									onClick={toggleContactModal as () => void}
								>
									Show contact info
								</button>
							</p>
							{/* FOLLOWERS AND FOLLOWING */}
							<h4 className="mt-1">
								<strong>
									{profileState.profile.following.length}
								</strong>{" "}
								Following{" "}
								<strong>
									{profileState.profile.followers.length}
								</strong>{" "}
								<button
									className="hover:underline"
									onClick={toggleFollowersModal}
								>
									Followers
								</button>
							</h4>
							<div className="mt-5">
								{profileState.profile.email !==
									data?.user?.email && (
									// DM BUTTON AND FOLLOW BUTTON
									<div className="flex justify-start items-center gap-2">
										{/* DM BUTTON */}
										<button
											onClick={handleChatButton}
											className="aspect-square bg-blue-500 hover:bg-blue-800 transition-all rounded-full text-white font-semibold p-3"
										>
											<FaEnvelope />
										</button>

										{/* FOLLOW BUTTON */}
										<button
											onClick={handleFollow}
											disabled={followButtonLoading}
											className={`${
												profileState.profile.followers.filter(
													(follow) =>
														follow.followerId ===
														yourData?.id
												).length > 0
													? "bg-transparent border-2 border-blue-500 hover:bg-blue-100 disabled:bg-blue-100 text-blue-500"
													: "bg-blue-500 disabled:bg-blue-800 hover:bg-blue-800 text-white"
											} transition-all rounded-full font-semibold py-2 px-4`}
										>
											{profileState.profile.followers.filter(
												(follow) =>
													follow.followerId ===
													yourData?.id
											).length > 0
												? "Following"
												: "Follow"}
										</button>
									</div>
								)}
							</div>
						</div>
						{profileState.profile.email === data?.user?.email && (
							// EDIT PROFILE BUTTON
							<div className="absolute top-3 right-3 flex justify-start items-center gap-3">
								<motion.button
									whileHover={{ scale: 1.1 }}
									whileTap={{ scale: 0.9 }}
									transition={{
										// ease: "easeInOut",
										duration: 0.3,
									}}
									onClick={
										toggleEditProfileModal as () => void
									}
									className="bg-blue-500 hover:bg-blue-800 transition-colors rounded-full text-white font-semibold py-2 px-4"
								>
									Edit profile
								</motion.button>
							</div>
						)}
					</div>
				</section>

				{/* SECOND CARD */}
				<section className="bg-white p-5 rounded-xl overflow-clip h-full">
					<p className="text-2xl font-bold">Recent activity</p>

					<div className="mt-2 flex flex-col items-start divide-y-[1px] gap-3 w-full">
						{activities.map((activity) => {
							// determine if it is post or comment
							const type = (activity as Comments).CommentID
								? "comment"
								: "post";
							return (
								<div
									onClick={() =>
										router.push(`/post/${activity.PostID}`)
									}
									className="w-full pt-1 cursor-pointer"
								>
									<p className="text-xs text-slate-600">
										<span className="font-semibold">
											{profileState.profile.name}
										</span>{" "}
										{type === "comment"
											? "commented"
											: "posted"}{" "}
										this{" "}
										{type === "comment" ? (
											<span>
												on{" "}
												<span className="font-semibold">
													{
														(
															activity as Comments & {
																Post: Posts;
															}
														).Post.PostText
													}
												</span>
											</span>
										) : (
											""
										)}{" "}
										• {useDate(activity.DatePosted, true)}
									</p>
									<div className="pt-1 flex justify-start items-start gap-3">
										{type === "post" &&
											(activity as Posts).Image && (
												<img
													src={
														(activity as Posts)
															.Image as string
													}
													className="max-w-[4rem] max-h-[4rem]"
													alt={
														(activity as Posts)
															.PostText
													}
												/>
											)}
										<p>
											{type === "comment"
												? (activity as Comments)
														.CommentText
												: (activity as Posts).PostText}
										</p>
									</div>
								</div>
							);
						})}
					</div>
				</section>

				{/* INTERESTS CARD */}
				<section className="bg-white p-5 rounded-xl overflow-clip h-full">
					<p className="text-2xl font-bold">Interests</p>

					<div className="mt-2 flex flex-wrap gap-3 w-full">
						{profileState.profile.interests.length != 1 ? (
							["football", "hockey", "computers"].map(
								(interest) => (
									<div className="bg-indigo-500 py-1 px-4 rounded-full">
										<p className="text-sm font-semibold text-white">
											{interest}
										</p>
									</div>
								)
							)
						) : (
							<div>no interests</div>
						)}
					</div>
				</section>
			</div>

			{/* MODALS */}

			<AnimatePresence
				initial={false}
				mode="wait"
				onExitComplete={() => null}
			>
				{editProfileModalOpen && (
					<EditProfileModal
						profileState={profileState}
						dispatch={dispatch}
						modalOpen={editProfileModalOpen}
						toggle={toggleEditProfileModal}
					/>
				)}

				{contactModalOpen && (
					<ContactDetailModal
						modalOpen={contactModalOpen}
						toggle={toggleContactModal}
						profileState={profileState}
						dispatch={dispatch}
					/>
				)}

				{followersModalOpen && (
					<FollowersModal
						modalOpen={followersModalOpen}
						profileState={profileState}
						toggle={toggleFollowersModal}
					/>
				)}
			</AnimatePresence>

			<Footer />
		</>
	);
};

export async function getStaticPaths() {
	const users = await prisma.user.findMany({
		select: {
			name: true,
		},
	});

	const paths = users.map((user) => {
		return {
			params: {
				username: user.name,
			},
		};
	});

	return { paths, fallback: false };
}

export async function getStaticProps(context: GetStaticPropsContext) {
	const { username } = context.params as { username: string };
	console.log("THE USERNAME:", username);

	// DO NOT INCLUDE PASSWORDS!!
	const profile = await prisma.user.findFirst({
		where: { name: username },
		select: {
			preferences: true,
			image: true,
			name: true,
			email: true,
			posts: {
				orderBy: {
					DatePosted: "desc",
				},
			},
			Comments: {
				include: {
					Post: true,
				},
				orderBy: {
					DatePosted: "desc",
				},
			},
			interests: true,
			phoneNumber: true,
			password: false,
			followers: {
				select: {
					followerId: true,
					follower: true,
				},
			},
			following: true,
			id: true,
		},
	});
	return {
		props: { profile: JSON.parse(JSON.stringify(profile)) },
		revalidate: 10,
	};
}

export default UserProfile;

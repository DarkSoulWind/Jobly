"DIRECT MESSAGES PAGE";

import React, { useEffect, useReducer, useState } from "react";
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { FaPaperPlane, FaPenSquare } from "react-icons/fa";
import { useSession } from "next-auth/react";
import io from "socket.io-client";
import { useQuery } from "react-query";
import ChatSection from "@components/chat/ChatSection";
import {
	ChatState,
	chatReducer,
	FollowResponse,
} from "@lib/reducers/chatReducer";
import { useModal } from "@lib/hooks/useModal";
import Modal from "@components/modal/Modal";
import Navbar from "@components/nav/Navbar";
import { AnimatePresence } from "framer-motion";
import {
	selectChatID,
	setChats,
	setFollows,
	setOnlineStatus,
	setSocket,
	setYourUsername,
} from "../../lib/actions";
import { Chats, AllFollows } from "../../lib/actions/types/chat";
import { Chat, Participant } from "@prisma/client";
import Alert from "@components/alert/Alert";

// GLOBAL STATE FOR THIS PAGE
const initChatState = (selectedChatID: string): ChatState => {
	return {
		selectedChatID,
		selectedUsername: "",
		yourUsername: "",
		chats: null,
		socket: null,
		messages: [],
		follows: null,
	};
};

const fetchChats = async (email: string) => {
	const response = await fetch(
		`http://localhost:3000/api/chats/email/${email}`
	);
	const responseData: Chats = await response.json();

	if (!response.ok) {
		throw new Error(JSON.stringify(responseData, null, 4));
	}
	return responseData;
};

const fetchFollows = async (email: string) => {
	const response = await fetch(`http://localhost:3000/api/follows/${email}`);
	const responseData: FollowResponse = await response.json();

	if (!response.ok) {
		throw new Error(JSON.stringify(responseData, null, 4));
	}

	const follows = [
		...(responseData?.followers.map(
			(follow) => follow.follower
		) as AllFollows),
		...(responseData?.following.map(
			(follow) => follow.following
		) as AllFollows),
	];

	return follows;
};

const DirectMessagesPage: NextPage = () => {
	const router = useRouter();
	const { data: sessionData } = useSession();
	const [chatState, dispatch] = useReducer(
		chatReducer,
		(router.query.chat as string) || "",
		initChatState
	);
	const [newChatOpen, setNewChatOpen, toggleNewChatOpen] = useModal(false);
	const [messageError, setMessageError] = useState("");

	const {
		isLoading: chatFetchLoading,
		isError: chatFetchError,
		data: chatData,
	} = useQuery("chats", () => fetchChats(sessionData?.user?.email!), {
		onSuccess(responseData) {
			if (router.query.chat !== "") {
				dispatch(
					selectChatID({
						chatID: router.query.chat as string,
						yourUsername: sessionData?.user?.name as string,
					})
				);
			}

			// set the chats to the response data if successful and set the username
			dispatch(setChats({ chats: responseData }));
			dispatch(
				setYourUsername({
					yourUsername: sessionData?.user?.name as string,
				})
			);
		},
	});

	const { data: followsData } = useQuery(
		"follows",
		() => fetchFollows(sessionData?.user?.email!),
		{
			onSuccess(responseData) {
				dispatch(setFollows({ follows: responseData }));
			},
		}
	);

	// RUNS ONCE WHEN THE PAGE LOADS
	// sets up the socket connection
	useEffect(() => {
		// setup a new socket connection and set that as the socket
		const newSocket = io("http://localhost:4000");
		dispatch(setSocket({ socket: newSocket }));

		// update online status when connected
		newSocket.emit("connected", {
			email: sessionData?.user?.email,
			socketID: newSocket.id,
		});

		if (router.query.chat) {
			newSocket.emit("join chat", router.query.chat);
		}

		// receive online status updates from the server
		newSocket.on(
			"updated online status",
			({ name, status }: { name: string; status: boolean }) => {
				dispatch(
					setOnlineStatus({
						username: name,
						onlineStatus: status,
					})
				);
			}
		);

		// cleanup function to disconnect the new socket connection
		return () => {
			newSocket.emit("disconnecting chat", sessionData?.user?.email);
			newSocket.disconnect();
		};
	}, []);

	const handleChatClicked = (
		chat: Chat & {
			participants: (Participant & {
				user: {
					image: string | null;
					name: string;
					online: boolean;
				};
			})[];
		}
	) => {
		dispatch(
			selectChatID({
				chatID: chat.id,
				yourUsername: sessionData?.user?.name as string,
			})
		);
		router.push({
			pathname: "/direct",
			query: {
				chat: chat.id,
			},
		});
		chatState.socket?.emit("join chat", chat.id);
	};

	return (
		<>
			<Head>
				<title>Direct • Jobly</title>
				<meta name="description" content="Your direct messages." />
			</Head>

			<Navbar />

			<div className="background"></div>

			<div className="pt-[4.5rem] pb-5 h-screen flex justify-center">
				{/* MAIN CHAT BOX */}
				<main className="w-[60rem] min-h-[20rem] mx-5 flex justify-start items-start overflow-clip bg-white border-[1px] border-slate-300 rounded-lg">
					{/* LEFT SIDE */}
					<div className="flex flex-col h-full w-1/2">
						{/* TITLE */}
						<div className="w-full flex justify-between h-fit items-center p-3 border-b-[1px] border-r-[1px] border-slate-300 ">
							<h1 className="font-bold text-2xl">Messages</h1>

							{/* BUTTON TO CREATE A NEW CHAT */}
							<FaPenSquare
								onClick={toggleNewChatOpen}
								className="w-7 h-7 cursor-pointer"
							/>
						</div>

						{/* LIST OF CHATS */}
						<div className="h-full w-full border-r-[1px] border-slate-300 flex flex-col justify-start items-start divide-y-[1px] divide-slate-300">
							<>
								{chatFetchLoading && <div>Loading chats</div>}

								{chatFetchError && (
									<div>Error loading chats</div>
								)}

								{/* CHAT LISTING */}
								{chatData?.map((chat) => {
									const guy = chat.participants?.find(
										(participant) =>
											participant.user.name !==
											sessionData?.user?.name
									);
									return (
										<div
											key={chat.id}
											// SWITCHING CHATS
											onClick={() => {
												handleChatClicked(chat);
											}}
											className={`w-full flex justify-start hover:bg-indigo-100 transition-all cursor-pointer items-center gap-3 py-2 px-3 ${
												guy?.chatID ===
												chatState.selectedChatID
													? "bg-indigo-100"
													: ""
											}`}
										>
											{/* PFP WITH ONLINE STATUS INDICATOR */}
											<div className="relative">
												<img
													src={
														guy?.user.image ??
														"https://i.pinimg.com/736x/dd/f0/11/ddf0110aa19f445687b737679eec9cb2.jpg"
													}
													onError={(e) => {
														e.preventDefault();
														console.log(
															"ERROR LOADING IMAGE"
														);
														e.currentTarget.onerror =
															null;
														e.currentTarget.classList.add(
															"animate-pulse"
														);
														e.currentTarget.src =
															"https://i.pinimg.com/736x/dd/f0/11/ddf0110aa19f445687b737679eec9cb2.jpg";
													}}
													className="w-11 h-11 rounded-full"
													alt="PFP"
												/>
												{/* LITTLE ONLINE INDICATOR CIRCLE */}
												<div
													className={`absolute border-2 border-white -bottom-0 right-0 w-4 h-4 rounded-full ${
														guy?.user.online
															? "bg-green-500"
															: "bg-gray-500"
													}`}
												></div>
											</div>
											<h4 className="font-semibold">
												{guy?.user.name}
											</h4>
										</div>
									);
								})}
							</>
						</div>
					</div>

					{/* RIGHT SIDE */}
					<div className="flex flex-col w-full h-full">
						{/* USERNAME BAR */}
						<div className="w-full p-3 border-b-[1px] border-slate-300 bg-indigo-400">
							{!chatState.selectedUsername ? (
								<h2 className="font-bold text-2xl">
									Chat not selected
								</h2>
							) : (
								<Link
									href={`/user/${chatState.selectedUsername}`}
								>
									<a className="font-bold text-white text-2xl">
										{chatState.selectedUsername}
									</a>
								</Link>
							)}
						</div>

						{/* MESSAGES CONTAINER */}
						{chatState.selectedChatID === "" ? (
							// if the selected chat id is empty then show default page
							<div className="w-full h-full flex flex-col gap-2 justify-center items-center">
								<div className="p-[1.5rem] aspect-square rounded-full w-[6rem] h-[6rem] border-2 border-black">
									<FaPaperPlane className="w-full h-full" />
								</div>
								<h3 className="text-2xl">Your messages</h3>
								<p className="text-sm text-slate-500">
									Select a chat to send private messages
								</p>
							</div>
						) : (
							<div className="h-full ">
								{/* else show the chat */}
								<ChatSection
									chatState={chatState}
									dispatch={dispatch}
									setMessageError={setMessageError}
								/>
							</div>
						)}
					</div>
				</main>
			</div>

			<AnimatePresence
				initial={false}
				mode="wait"
				onExitComplete={() => null}
			>
				{messageError !== "" && (
					<Alert
						level="Error"
						message={messageError}
						open={messageError.length > 0}
						closeAction={() => setMessageError("")}
					/>
				)}
				{newChatOpen && (
					<Modal
						open={newChatOpen}
						title="New message"
						confirmButton="Next"
						confirmButtonAction={toggleNewChatOpen}
					>
						<div>
							<h5 className="font-semibold text-sms px-3 pb-3">
								Suggested
							</h5>

							{/* RECOMMEND FOLLOWS */}
							<form>
								{followsData?.map((follow, index) => (
									<div key={follow.id}>
										<div className="w-full flex hover:bg-slate-100 cursor-pointer justify-between items-center px-3 py-2">
											<div className="flex items-center gap-2">
												<img
													src={
														follow.image ??
														"https://i.pinimg.com/736x/dd/f0/11/ddf0110aa19f445687b737679eec9cb2.jpg"
													}
													className="rounded-full w-12 h-12"
													onError={(e) => {
														e.preventDefault();
														console.log(
															"ERROR LOADING IMAGE"
														);
														e.currentTarget.onerror =
															null;
														e.currentTarget.classList.add(
															"animate-pulse"
														);
														e.currentTarget.src =
															"https://i.pinimg.com/736x/dd/f0/11/ddf0110aa19f445687b737679eec9cb2.jpg";
													}}
													alt="PFP"
												/>

												<div className="block -space-y-1 text-sm">
													<p className="font-bold">
														{follow.name}
													</p>
													<p>hi</p>
												</div>
											</div>

											<input
												type="radio"
												className="w-5 h-5"
											/>
										</div>
									</div>
								))}
							</form>
						</div>
					</Modal>
				)}
			</AnimatePresence>
		</>
	);
};

export default DirectMessagesPage;

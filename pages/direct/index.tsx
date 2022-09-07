import React, { useEffect, useReducer } from "react";
import Modal from "../../components/modal/Modal";
import { NextPage } from "next";
import Navbar from "../../components/nav/Navbar";
import Head from "next/head";
import { FaPaperPlane, FaPenSquare } from "react-icons/fa";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import io from "socket.io-client";
import ChatSection from "../../components/chat/ChatSection";
import {
	ChatState,
	chatReducer,
	CHAT_ACTION,
	Chats,
	FollowResponse,
	AllFollows,
} from "../../reducers/chatReducer";
import { useModal } from "../../hooks/useModal";
import { AnimatePresence } from "framer-motion";

// GLOBAL STATE FOR THIS PAGE
const initialChatState: ChatState = {
	selectedChatID: "",
	selectedUsername: "",
	yourUsername: "",
	chats: null,
	socket: null,
	messages: [],
	follows: null,
};

const DirectMessagesPage: NextPage = () => {
	const router = useRouter();
	const { data } = useSession();
	const [chatState, dispatch] = useReducer(chatReducer, initialChatState);
	const [newChatOpen, setNewChatOpen, toggleNewChatOpen] = useModal(false);

	// RUNS ONCE WHEN THE COMPONENT IS MOUNTED
	// retrieves all chats that the user has participants in
	useEffect(() => {
		const getChatsByEmail = async () => {
			try {
				const response = await fetch(
					`http://localhost:3000/api/chats/email/${data?.user?.email}`
				);
				const responseData: Chats = await response.json();

				if (!response.ok) {
					throw new Error(JSON.stringify(responseData, null, 4));
				}

				// if the page has a chat query then select that chat id
				if (router.query.chat !== "") {
					dispatch({
						type: CHAT_ACTION.SELECT_CHAT_ID,
						payload: {
							chatID: router.query.chat as string,
							yourUsername: data?.user?.name as string,
						},
					});
				}

				// set the chats to the response data if successful and set the username
				dispatch({
					type: CHAT_ACTION.SET_CHATS,
					payload: { chats: responseData },
				});
				dispatch({
					type: CHAT_ACTION.SET_YOUR_USERNAME,
					payload: { yourUsername: data?.user?.name ?? "" },
				});
			} catch (error) {
				console.error(error);
			}
		};

		// gets data for user followers and following
		const getFollows = async () => {
			await fetch(
				`http://localhost:3000/api/follows/${data?.user?.email}`
			)
				.then(async (response) => {
					return await response.json();
				})
				.then((data: FollowResponse) => {
					const follows = [
						...(data?.followers.map(
							(follow) => follow.follower
						) as AllFollows),
						...(data?.following.map(
							(follow) => follow.following
						) as AllFollows),
					];
					dispatch({
						type: CHAT_ACTION.SET_FOLLOWS,
						payload: { follows },
					});
					console.log(
						"GOT THE FOLLOWERS AND FOLLOWING",
						JSON.stringify(follows, null, 4)
					);
				})
				.catch((error) => {
					console.error(error);
				});
		};

		getChatsByEmail();
		getFollows();

		// setup a new socket connection and set that as the socket
		const newSocket = io("http://localhost:4000");
		dispatch({
			type: CHAT_ACTION.SET_SOCKET,
			payload: { socket: newSocket },
		});

		// update online status when connected
		newSocket.emit("connected", data?.user?.email);

		// receive online status updates from the server
		newSocket.on(
			"updated online status",
			({ name, status }: { name: string; status: boolean }) => {
				dispatch({
					type: CHAT_ACTION.SET_ONLINE_STATUS,
					payload: { username: name, onlineStatus: status },
				});
			}
		);

		// cleanup function to disconnect the new socket connection
		return () => {
			newSocket.emit("disconnecting chat", data?.user?.email);
			newSocket.disconnect();
		};
	}, [data]);

	return (
		<div>
			<Head>
				<title>Direct • Jobly</title>
				<meta name="description" content="Your direct messages." />
			</Head>
			<Navbar />
			<div className="background"></div>
			<div className="pt-[4.5rem] pb-5 h-screen flex justify-center">
				{/* MAIN CHAT BOX */}
				<main className="w-[60rem] max-h-[55rem] min-h-[20rem] mx-5 flex justify-start items-start overflow-clip bg-white border-[1px] border-slate-300 rounded-lg">
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
							{chatState.chats === null && (
								<div>Loading chats</div>
							)}

							{/* CHAT LISTING */}
							{chatState.chats?.map((chat) => {
								const guy = chat.Participants.find(
									(participant) =>
										participant.User.name !==
										data?.user?.name
								);
								return (
									<div
										key={chat.ChatID}
										// SWITCHING CHATS
										onClick={() => {
											router.push({
												pathname: "/direct",
												query: {
													chat: chat.ChatID,
												},
											});
											dispatch({
												type: CHAT_ACTION.SELECT_CHAT_ID,
												payload: {
													chatID: chat.ChatID,
													yourUsername: data?.user
														?.name as string,
												},
											});
											console.log(
												"selected chat id",
												chatState.selectedChatID
											);
										}}
										className={`w-full flex justify-start hover:bg-indigo-100 transition-all cursor-pointer items-center gap-3 py-2 px-3 ${
											guy?.ChatID ===
											chatState.selectedChatID
												? "bg-indigo-100"
												: ""
										}`}
									>
										{/* PFP WITH ONLINE STATUS INDICATOR */}
										<div className="relative">
											<img
												src={
													guy?.User.image ??
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
													guy?.User.online
														? "bg-green-500"
														: "bg-gray-500"
												}`}
											></div>
										</div>
										<h4 className="font-semibold">
											{guy?.User.name}
										</h4>
									</div>
								);
							})}
						</div>
					</div>

					{/* RIGHT SIDE */}
					<div className="flex flex-col w-full h-full">
						{/* USERNAME BAR */}
						<div className="w-full col-span-2 p-3 h-fit border-b-[1px] border-slate-300 bg-indigo-400">
							{chatState.selectedUsername === "" ? (
								<h2 className="font-bold text-2xl">
									Chat not selected
								</h2>
							) : (
								<div className="font-bold text-2xl">
									{chatState.selectedUsername}
								</div>
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
							// else show the chat
							<ChatSection
								chatState={chatState}
								dispatch={dispatch}
							/>
						)}
					</div>
				</main>
			</div>

			<AnimatePresence
				initial={false}
				mode="wait"
				onExitComplete={() => null}
			>
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
								{chatState.follows?.map((follow, index) => (
									<div key={index}>
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
		</div>
	);
};

export default DirectMessagesPage;
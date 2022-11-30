import React, {
	FC,
	FormEvent,
	useEffect,
	useState,
	useRef,
	Dispatch,
} from "react";
import MessageComponent from "./Message";
import { ChatState, Action, Message } from "@reducers/chatReducer";
import { CHAT_ACTION } from "../../actions/types/chat";
import { useRouter } from "next/router";
import { encrypt } from "@lib/hash";

interface ChatSectionProps {
	chatState: ChatState;
	dispatch: Dispatch<Action>;
}

// HOLDS ALL THE MESSAGES
const ChatSection: FC<ChatSectionProps> = ({ chatState, dispatch }) => {
	const router = useRouter();
	const [textInput, setTextInput] = useState("");
	const scrollDummy = useRef<HTMLDivElement>(null);

	// Check to see if you are part of the chat
	// if not, redirect to 404 page
	if (
		!chatState.chats?.find((chat) => chat.id === chatState.selectedChatID)
	) {
		router.push("/404");
	}

	// TODO: turn this shit into a fucking hook its fucking hideous

	// GET INITIAL MESSAGES FOR THE CHAT
	// RUNS EVERYTIME THE SELECTED CHAT ID CHANGES
	useEffect(() => {
		const getMessagesByChatID = async () => {
			try {
				const response = await fetch(
					`http://localhost:3000/api/messages/${chatState.selectedChatID}`
				);
				const data: Message[] = await response.json();

				if (!response.ok)
					throw new Error(JSON.stringify(data, null, 4));

				// if successful, set the messages to that
				dispatch({
					type: CHAT_ACTION.SET_MESSAGES,
					payload: { messages: data },
				});
			} catch (error) {
				console.error(error);
			}
		};

		getMessagesByChatID();
	}, [chatState.selectedChatID]);

	// RUNS EVERYTIME THE CHAT IS CHANGED
	useEffect(() => {
		// handling receiving messages from the server
		chatState.socket?.on("server new message", (message: Message) => {
			// if the message belongs to that chat that you're in then it will be displayed
			if (message.chatID === chatState.selectedChatID) {
				dispatch({
					type: CHAT_ACTION.NEW_MESSAGE,
					payload: {
						newMessage: {
							...message,
							text: encrypt(message.text, message.cipher!.key),
						},
					},
				});
			}

			// scroll to the bottom if you sent the message
			setTimeout(() => {
				if (message.sender.name === chatState.yourUsername) {
					scrollDummy.current?.scrollIntoView({ behavior: "smooth" });
				}
			}, 100);
		});

		// handling deleted messages
		chatState.socket?.on("server deleted message", ({ id, chatID }) => {
			// only handle message if it is in the chat that you are in
			if (chatID === chatState.selectedChatID) {
				console.log("deleted message in this chat with id", id);
				dispatch({
					type: CHAT_ACTION.DELETE_MESSAGE,
					payload: { messageID: id },
				});
			}
		});

		// unsubscribe from socket events when component is removed
		return () => {
			chatState.socket?.off("server new message");
			chatState.socket?.off("server deleted message");
		};
	}, [chatState.messages]);

	// the send message form is submitted
	const sendMessage = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (textInput.trim() === "") return;

		const messageData = {
			senderUsername: chatState.yourUsername,
			chatID: chatState.selectedChatID,
			text: textInput,
		};
		chatState.socket?.emit("sent message", messageData);
		setTextInput("");
	};

	return (
		<>
			<div className="w-full h-full max-h-[79vh] flex flex-col relative">
				<div className="h-full flex flex-col justify-start px-3 py-3 overflow-y-scroll">
					{/* push all the messages to the bottom */}
					<div className="mt-auto"></div>

					{/* ALL THE MESSAGES */}
					<div className="flex flex-col gap-2">
						{chatState.messages.map((message, index) => {
							return (
								<>
									{/* check if the dates are different, and separate them messages if they are */}
									{new Date(message.datePosted).getDate() !==
										new Date(
											chatState.messages[
												index - 1
											]?.datePosted
										)?.getDate() && (
										<div className="w-full py-4 text-indigo-800 flex justify-center items-center">
											<p className="text-xs">
												{new Date(
													message.datePosted
												).toLocaleDateString()}
											</p>
										</div>
									)}

									<MessageComponent
										key={message.id}
										id={message.id}
										message={message.text}
										receiver={
											chatState.yourUsername ===
											message.sender.name
										}
										// check to see if the author of the message is the same as the previous message
										continuing={
											message.sender?.name ===
											chatState.messages[index - 1]
												?.sender.name
										}
										chatState={chatState}
										pfp={message.sender.image as string}
										datePosted={message.datePosted}
									/>
								</>
							);
						})}
					</div>
					{/* dummy to scroll to the bottom when you post a new message */}
					<div ref={scrollDummy}></div>
				</div>
			</div>
			{/* input box to enter messages */}
			<form
				onSubmit={sendMessage}
				className="w-full h-full rounded-br-lg bg-indigo-400 px-3 py-2"
			>
				<input
					className="w-full h-fit border-[1px] border-slate-300 rounded-full py-2 px-4 text-sm"
					type="text"
					placeholder="Message..."
					value={textInput}
					onChange={(e) => setTextInput(e.target.value)}
				/>
			</form>
		</>
	);
};

export default ChatSection;

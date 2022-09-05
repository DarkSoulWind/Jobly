import React, {
	FC,
	FormEvent,
	useEffect,
	useState,
	useRef,
	Dispatch,
} from "react";
import MessageComponent from "./Message";
import {
	ChatState,
	Message,
	Action,
	CHAT_ACTION,
} from "../../reducers/chatReducer";
import { useRouter } from "next/router";

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
		!chatState.chats?.find(
			(chat) => chat.ChatID === chatState.selectedChatID
		)
	) {
		router.push("/404");
	}

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
				console.log("MESSAGES", JSON.stringify(data, null, 4));
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
		chatState.socket?.on("server new message", (message: any) => {
			// if the message belongs to that chat that you're in then it will be displayed
			if (message.ChatID === chatState.selectedChatID) {
				console.log("the server says back:", message);
				dispatch({
					type: CHAT_ACTION.NEW_MESSAGE,
					payload: { newMessage: message },
				});
			}

			// scroll to the bottom if you sent the message
			setTimeout(() => {
				if (message.Sender.name === chatState.yourUsername) {
					scrollDummy.current?.scrollIntoView({ behavior: "smooth" });
				}
			}, 100);
		});

		// handling deleted messages
		chatState.socket?.on(
			"server deleted message",
			({ messageID, chatID }) => {
				// only handle message if it is in the chat that you are in
				if (chatID === chatState.selectedChatID) {
					console.log(
						"deleted message in this chat with id",
						messageID
					);
					dispatch({
						type: CHAT_ACTION.DELETE_MESSAGE,
						payload: { messageID },
					});
				}
			}
		);

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
		<div className="w-full max-h-[55rem] flex flex-col relative">
			<div className="min-h-fit h-full flex flex-col px-3 gap-2 overflow-y-scroll">
				{/* push all the messages to the bottom */}
				<div className="mt-auto"></div>

				{/* ALL THE MESSAGES */}
				{chatState.messages.map((message, index) => (
					<div key={message.MessageID}>
						<MessageComponent
							id={message.MessageID}
							message={message.Text}
							receiver={
								chatState.yourUsername === message.Sender.name
							}
							continuing={
								message.Sender.name ===
								chatState.messages[index - 1]?.Sender.name
							}
							chatState={chatState}
							pfp={message.Sender.image as string}
							datePosted={message.DatePosted}
						/>
					</div>
				))}

				{/* dummy to scroll to the bottom when you post a new message */}
				<div ref={scrollDummy}></div>
			</div>

			{/* input box to enter messages */}
			<form onSubmit={sendMessage} className="w-full h-[7rem] px-3 pt-2">
				<input
					className="w-full border-[1px] border-slate-300 rounded-full py-2 px-4 text-sm"
					type="text"
					placeholder="Message..."
					value={textInput}
					onChange={(e) => setTextInput(e.target.value)}
				/>
			</form>
		</div>
	);
};

export default ChatSection;

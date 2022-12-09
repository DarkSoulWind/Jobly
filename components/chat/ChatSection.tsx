import React, { FC, FormEvent, useState, useRef, Dispatch } from "react";
import MessageComponent from "./Message";
import { ChatState, Action } from "@reducers/chatReducer";
import { useRouter } from "next/router";
import useChatSection from "@hooks/useChatSection";

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

	useChatSection(chatState, dispatch, scrollDummy);

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
										// and they were both posted on the same date
										continuing={
											message.sender?.name ===
												chatState.messages[index - 1]
													?.sender.name &&
											new Date(
												message.datePosted
											).getDate() ===
												new Date(
													chatState.messages[
														index - 1
													].datePosted
												).getDate()
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

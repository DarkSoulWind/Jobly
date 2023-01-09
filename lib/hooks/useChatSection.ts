import { Dispatch, RefObject, useEffect } from "react";
import { encrypt } from "@lib/hash";
import { ChatState, Action, Message } from "@lib/reducers/chatReducer";
import { CHAT_ACTION } from "@lib/actions/types/chat";

const useChatSection = (
	chatState: ChatState,
	dispatch: Dispatch<Action>,
	scrollDummy: RefObject<HTMLDivElement>
) => {
	// GET INITIAL MESSAGES FOR THE CHAT
	// RUNS EVERYTIME THE SELECTED CHAT ID CHANGES
	// useEffect(() => {
	// 	const getMessagesByChatID = async () => {
	// 		try {
	// 			const response = await fetch(
	// 				`${PRODUCTION_URL}/api/messages/${chatState.selectedChatID}`
	// 			);
	// 			const data: Message[] = await response.json();

	// 			if (!response.ok)
	// 				throw new Error(JSON.stringify(data, null, 4));

	// 			// if successful, set the messages to that
	// 			dispatch({
	// 				type: CHAT_ACTION.SET_MESSAGES,
	// 				payload: { messages: data },
	// 			});
	// 		} catch (error) {
	// 			console.error(error);
	// 		}
	// 	};

	// 	getMessagesByChatID();
	// }, [chatState.selectedChatID]);

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
};

export default useChatSection;

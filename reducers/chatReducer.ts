import { Socket } from "socket.io-client";
import { AllFollows, Chats, CHAT_ACTION } from "../actions/types/chat";

// THE TYPE OF RESPONSE WE GET FROM /api/follows/[email]
export type FollowResponse = {
	followers: {
		follower: {
			image: string | null;
			name: string;
			id: string;
		};
	}[];
	following: {
		following: {
			image: string | null;
			name: string;
			id: string;
		};
	}[];
} | null;

// THE TYPE OF RESPONSE WE GET FROM /api/messages/[chatID]
export type Message = {
	text: string;
	id: string;
	sender: {
		image: string | null;
		name: string;
	};
	chatID: string;
	senderID: string;
	datePosted: Date;
	received: boolean;
};

// THE TYPE FOR THE GLOBAL CHAT STATE
export interface ChatState {
	selectedChatID: string;
	selectedUsername: string;
	yourUsername: string;
	chats: Chats | null;
	socket: Socket | null;
	messages: Message[];
	follows: AllFollows | null;
}

// the type for the dispatch action
export interface Action {
	type: CHAT_ACTION;
	payload: {
		chatID?: string;
		yourUsername?: string;
		username?: string; // for setting the online status of a user
		onlineStatus?: boolean;
		chats?: Chats;
		socket?: Socket;
		messages?: Message[];
		messageID?: string;
		newMessage?: Message;
		follows?: AllFollows | null;
	};
}

export const chatReducer = (state: ChatState, action: Action): ChatState => {
	switch (action.type) {
		case CHAT_ACTION.SELECT_CHAT_ID:
			// this clapped piece of code finds the name of another user in the chat
			// that doesnt have the same name as you and uses that as the name of the chat
			console.log(
				"your username",
				action.payload.yourUsername,
				"\nselected id:",
				action.payload.chatID
			);
			const newUsername = state.chats
				?.find((chat) => chat.id === state.selectedChatID)
				?.participants.find(
					(participant) =>
						participant.user.name !== action.payload.yourUsername
				)?.user.name;
			console.log("selected username", newUsername);
			return {
				...state,
				selectedUsername: newUsername ?? "",
				selectedChatID: action.payload.chatID ?? "",
			};

		case CHAT_ACTION.SET_CHATS:
			return { ...state, chats: action.payload.chats ?? null };

		case CHAT_ACTION.SET_SOCKET:
			return { ...state, socket: action.payload.socket ?? null };

		case CHAT_ACTION.SET_MESSAGES:
			return { ...state, messages: action.payload.messages ?? [] };

		case CHAT_ACTION.SET_YOUR_USERNAME:
			console.log("your username", action.payload.yourUsername);
			return {
				...state,
				yourUsername: action.payload.yourUsername ?? "",
			};

		case CHAT_ACTION.SET_FOLLOWS:
			return {
				...state,
				follows: action.payload.follows ?? null,
			};

		// change the online status of every participant of every chat
		case CHAT_ACTION.SET_ONLINE_STATUS:
			return {
				...state,
				chats: state.chats?.map((chat) => {
					return {
						...chat,
						Participants: chat.participants.map((participant) => {
							participant.user.online =
								participant.user.name ===
								action.payload.username
									? (action.payload.onlineStatus as boolean)
									: participant.user.online;
							return participant;
						}),
					};
				}) as Chats,
			};

		case CHAT_ACTION.NEW_MESSAGE:
			return {
				...state,
				messages: [...state.messages, action.payload.newMessage!],
			};

		case CHAT_ACTION.DELETE_MESSAGE:
			return {
				...state,
				messages: state.messages.filter(
					(message) => message.id !== action.payload.messageID
				),
			};

		default:
			return state;
	}
};

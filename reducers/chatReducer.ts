import { StringLike } from "@firebase/util";
import { Chat, Participant } from "@prisma/client";
import { Socket } from "socket.io-client";

// THE TYPE OF CHATS THAT WE GET FROM /api/chats/email/[email]
export type Chats = (Chat & {
	Participants: (Participant & {
		User: {
			name: string;
			image: string | null;
			online: boolean;
		};
	})[];
})[];

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

export type AllFollows = {
	image: string | null;
	name: string;
	id: string;
}[];

// THE TYPE OF RESPONSE WE GET FROM /api/messages/[chatID]
export type Message = {
	MessageID: string;
	Text: string;
	DatePosted: Date;
	Received: boolean;
	Sender: {
		image: string | null;
		name: string;
	};
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

// the different kinds of chat actions that can be dispatched
export enum CHAT_ACTION {
	SELECT_CHAT_ID,
	SET_CHATS,
	SET_SOCKET,
	SET_MESSAGES,
	SET_YOUR_USERNAME,
	SET_FOLLOWS,
	SET_ONLINE_STATUS,
	NEW_MESSAGE,
	DELETE_MESSAGE,
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
				?.find((chat) => chat.ChatID === state.selectedChatID)
				?.Participants.find(
					(participant) =>
						participant.User.name !== action.payload.yourUsername
				)?.User.name;
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
						Participants: chat.Participants.map((participant) => {
							participant.User.online =
								participant.User.name ===
								action.payload.username
									? (action.payload.onlineStatus as boolean)
									: participant.User.online;
							return participant;
						}),
					};
				}) as Chats,
			};

		case CHAT_ACTION.NEW_MESSAGE:
			return {
				...state,
				messages: [
					...state.messages,
					action.payload.newMessage as Message,
				],
			};

		case CHAT_ACTION.DELETE_MESSAGE:
			return {
				...state,
				messages: state.messages.filter(
					(message) => message.MessageID !== action.payload.messageID
				),
			};

		default:
			return state;
	}
};

import { Chat, Participant } from "@prisma/client";
import { Socket } from "socket.io-client";
import { addAbortSignal } from "stream";

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

export type AllFollows = {
	image: string | null;
	name: string;
	id: string;
}[];

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

export namespace DataTypes {
	export interface SelectChatIDData {
		yourUsername: string;
		chatID: string;
	}

	export interface SetChatsData {
		chats: Chats;
	}

	export interface SetSocketData {
		socket: Socket;
	}

	export interface SetFollowsData {
		follows: AllFollows;
	}

	export interface SetYourUsernameData {
		yourUsername: string;
	}

	export interface SetOnlineStatusData {
		username: string;
		onlineStatus: boolean;
	}
}

export namespace ActionTypes {
	export interface SelectChatIDAction {
		type: CHAT_ACTION.SELECT_CHAT_ID;
		payload: {
			yourUsername: string;
			chatID: string;
		};
	}

	export interface SetChatsAction {
		type: CHAT_ACTION.SET_CHATS;
		payload: {
			chats: Chats;
		};
	}

	export interface SetSocketAction {
		type: CHAT_ACTION.SET_SOCKET;
		payload: {
			socket: Socket;
		};
	}

	export interface SetFollowsAction {
		type: CHAT_ACTION.SET_FOLLOWS;
		payload: {
			follows: AllFollows;
		};
	}

	export interface SetYourUsernameAction {
		type: CHAT_ACTION.SET_YOUR_USERNAME;
		payload: {
			yourUsername: string;
		};
	}

	export interface SetOnlineStatusAction {
		type: CHAT_ACTION.SET_ONLINE_STATUS;
		payload: {
			username: string;
			onlineStatus: boolean;
		};
	}
}

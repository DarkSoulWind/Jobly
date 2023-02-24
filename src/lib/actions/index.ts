import { CHAT_ACTION, DataTypes, ActionTypes } from "./types/chat";

export const selectChatID = ({
	chatID,
	yourUsername,
}: DataTypes.SelectChatIDData): ActionTypes.SelectChatIDAction => {
	return {
		type: CHAT_ACTION.SELECT_CHAT_ID,
		payload: {
			chatID,
			yourUsername,
		},
	};
};

export const setChats = ({
	chats,
}: DataTypes.SetChatsData): ActionTypes.SetChatsAction => {
	return {
		type: CHAT_ACTION.SET_CHATS,
		payload: { chats },
	};
};

export const setSocket = ({
	socket,
}: DataTypes.SetSocketData): ActionTypes.SetSocketAction => {
	return {
		type: CHAT_ACTION.SET_SOCKET,
		payload: {
			socket,
		},
	};
};

export const setFollows = ({
	follows,
}: DataTypes.SetFollowsData): ActionTypes.SetFollowsAction => {
	return {
		type: CHAT_ACTION.SET_FOLLOWS,
		payload: {
			follows,
		},
	};
};

export const setYourUsername = ({
	yourUsername,
}: DataTypes.SetYourUsernameData): ActionTypes.SetYourUsernameAction => {
	return {
		type: CHAT_ACTION.SET_YOUR_USERNAME,
		payload: {
			yourUsername,
		},
	};
};

export const setOnlineStatus = ({
	username,
	onlineStatus,
}: DataTypes.SetOnlineStatusData): ActionTypes.SetOnlineStatusAction => {
	return {
		type: CHAT_ACTION.SET_ONLINE_STATUS,
		payload: {
			username,
			onlineStatus,
		},
	};
};

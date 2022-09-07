import {
	User,
	UserPreferences,
	Posts,
	PostLikes,
	Comments,
} from "@prisma/client";

export type PostsUserPostLikesComments = Posts & {
	User: User & {
		preferences: UserPreferences | null;
	};
	PostLikes: PostLikes[];
	Comments: Comments[];
};

export type UserWithPreferences = User & {
	preferences: UserPreferences | null;
};

export interface FeedState {
	posts: PostsUserPostLikesComments[] | null;
	error: string;
	success: string;
}

export enum FEED_ACTION {
	SET_POSTS,
	REMOVE_POST,
	SET_SUCCESS_MESSAGE,
	SET_ERROR_MESSAGE,
}

export interface Action {
	type: FEED_ACTION;
	payload: {
		posts?: PostsUserPostLikesComments[];
		postID?: number;
		success?: string;
		error?: string;
	};
}

export const feedReducer = (state: FeedState, action: Action): FeedState => {
	switch (action.type) {
		case FEED_ACTION.REMOVE_POST:
			return {
				...state,
				posts:
					state.posts?.filter(
						(post) => post.PostID !== action.payload.postID
					) ?? state.posts,
				error: null,
				success: "Removed post.",
			};
		case FEED_ACTION.SET_SUCCESS_MESSAGE:
			return {
				...state,
				success: action.payload.success ?? "",
				error: "",
			};
		case FEED_ACTION.SET_ERROR_MESSAGE:
			return { ...state, error: action.payload.error ?? "", success: "" };
		case FEED_ACTION.SET_POSTS:
			return { ...state, posts: action.payload.posts ?? state.posts };
		default:
			return state;
	}
};

import {
	User,
	UserPreference,
	Post,
	PostLike,
	Comment,
	Follow,
} from "@prisma/client";

export type PostsUserPostLikesComments = Post & {
	User: User & {
		preferences: UserPreference | null;
	};
	PostLikes: PostLike[];
	Comments: Comment[];
};

export type UserWithPreferences = {
	preferences: UserPreference | null;
	followers: Follow[];
	following: Follow[];
	id: string;
	image: string | null;
	name: string;
} | null;

export interface FeedState {
	posts: PostsUserPostLikesComments[] | null;
	error: string | null;
	success: string | null;
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
		postID?: string;
		success?: string | null;
		error?: string | null;
	};
}

export const feedReducer = (state: FeedState, action: Action): FeedState => {
	switch (action.type) {
		case FEED_ACTION.REMOVE_POST:
			return {
				...state,
				posts:
					state.posts?.filter(
						(post) => post.id !== action.payload.postID
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

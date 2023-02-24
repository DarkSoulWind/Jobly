import {
	Comment,
	Follow,
	Interest,
	Post,
	User,
	UserPreference,
} from "@prisma/client";
import { InferGetServerSidePropsType, InferGetStaticPropsType } from "next";
import { getServerSideProps } from "src/pages/user/[username]";

export interface UserProfile {
	Comments: (Comment & {
		Post: Post;
	})[];
	name: string;
	preferences: UserPreference | null;
	interests: Interest[];
	image: string | null;
	email: string | null;
	phoneNumber: string | null;
	followers: {
		follower: User;
		followerId: string;
	}[];
	following: Follow[];
	id: string;
	posts: Post[];
}

export type ProfileState = InferGetServerSidePropsType<
	typeof getServerSideProps
> & {
	isFollowing: boolean;
	successMessage: string;
};

export enum PROFILE_ACTION {
	SET_IS_FOLLOWING,
	SET_PROFILE_INFO,
	SET_SUCCESS_MESSAGE,
}

export interface Action {
	type: PROFILE_ACTION;
	payload: {
		isFollowing?: boolean;
		successMessage?: string;
		follow?: {
			action: "add" | "remove";
			data: {
				follower: User;
				followerId: string;
			};
		};
		profileUpdate?: Omit<UserPreference, "id" | "userID" | "banner"> & {
			phoneNumber: string;
		};
	};
}

export const profileReducer = (
	state: ProfileState,
	action: Action
): ProfileState => {
	switch (action.type) {
		// change whether the user is being followed or not and their follow count
		// this is clapped and it doesnt work
		case PROFILE_ACTION.SET_IS_FOLLOWING:
			return {
				...state,
				isFollowing: action.payload.isFollowing ?? state.isFollowing,

				followers:
					action.payload.follow?.action === "add"
						? [...state.followers!, action.payload.follow.data]
						: [...state.followers!].filter(
								(follow) =>
									follow.followerId !==
									action.payload.follow?.data.followerId
						  ),
			};
		case PROFILE_ACTION.SET_PROFILE_INFO:
			// const {FirstName, LastName, Pronouns, Bio, CountryRegion, PostalCode, City, School, PhoneType} = action.payload.profileUpdate as {[key:string]: string};
			return {
				...state,

				phoneNumber:
					action.payload.profileUpdate?.phoneNumber ??
					state.phoneNumber,

				preferences: {
					...state.preferences,
					...action.payload.profileUpdate,
				},
			};
		case PROFILE_ACTION.SET_SUCCESS_MESSAGE:
			return {
				...state,
				successMessage:
					action.payload.successMessage ?? state.successMessage,
			};
		default:
			return state;
	}
};

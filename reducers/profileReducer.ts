import {
	Comments,
	Follows,
	Interests,
	Posts,
	User,
	UserPreferences,
} from "@prisma/client";

export interface UserProfile {
	Comments: (Comments & {
		Post: Posts;
	})[];
	name: string;
	preferences: UserPreferences | null;
	interests: Interests[];
	image: string | null;
	email: string | null;
	phoneNumber: string | null;
	followers: {
		follower: User;
		followerId: string;
	}[];
	following: Follows[];
	id: string;
	posts: Posts[];
}

export interface ProfileState {
	profile: UserProfile;
	isFollowing: boolean;
	successMessage: string;
}

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
		profileUpdate?: {
			FirstName?: string;
			LastName?: string;
			Pronouns?: string;
			Bio?: string;
			CountryRegion?: string;
			PostalCode?: string;
			City?: string;
			School?: string;
			phoneNumber?: string;
			PhoneType?: string;
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
				profile: {
					...state.profile,
					followers:
						action.payload.follow?.action === "add"
							? [
									...state.profile.followers,
									action.payload.follow.data,
							  ]
							: [...state.profile.followers].filter(
									(follow) =>
										follow.followerId !==
										action.payload.follow?.data.followerId
							  ),
				},
			};
		case PROFILE_ACTION.SET_PROFILE_INFO:
			// const {FirstName, LastName, Pronouns, Bio, CountryRegion, PostalCode, City, School, PhoneType} = action.payload.profileUpdate as {[key:string]: string};
			return {
				...state,
				profile: {
					...state.profile,
					phoneNumber:
						action.payload.profileUpdate?.phoneNumber ??
						state.profile.phoneNumber,
					preferences: {
						...(state.profile.preferences as UserPreferences),
						...action.payload.profileUpdate,
					},
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

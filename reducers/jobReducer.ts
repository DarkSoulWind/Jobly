export interface JobListing {
	jobTitle: string;
	jobLocation: string;
	jobDescription: string;
}

export interface JobSearchState {
	searchInput: string;
	locationInput: string;
	jobResults: JobListing[];
	loading: boolean;
}

export enum JOB_SEARCH_ACTION {
	SET_JOB_RESULTS,
	SET_SEARCH_INPUTS,
	SET_LOADING,
}

export interface Action {
	type: JOB_SEARCH_ACTION;
	payload: {
		searchInput?: string;
		locationInput?: string;
		jobResults?: JobListing[];
		loading?: boolean;
	};
}

export const JobSearchReducer = (
	state: JobSearchState,
	action: Action
): JobSearchState => {
	switch (action.type) {
		case JOB_SEARCH_ACTION.SET_JOB_RESULTS:
			return { ...state, jobResults: action.payload.jobResults ?? [] };
		case JOB_SEARCH_ACTION.SET_SEARCH_INPUTS:
			return {
				...state,
				searchInput: action.payload.searchInput ?? state.searchInput,
				locationInput:
					action.payload.locationInput ?? state.locationInput,
			};
		case JOB_SEARCH_ACTION.SET_LOADING:
			return { ...state, loading: action.payload.loading ?? false };
		default:
			return state;
	}
};

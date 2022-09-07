import React, { FC } from "react";

// Skeleton job listing for when data is loading
const LoadingJobListing: FC = () => {
	return (
		<div className="w-80 flex flex-col items-start justify-start gap-2 p-5 border-[1px] border-slate-300 bg-white rounded-lg">
			<div className="w-full rounded-full h-5 bg-slate-200 animate-pulse"></div>
			<div className="w-10/12 rounded-full h-5 bg-slate-200 animate-pulse"></div>
			<div className="w-1/2 rounded-full h-5 bg-slate-200 animate-pulse"></div>
			<div className="w-4/6 rounded-full h-5 bg-slate-200 animate-pulse"></div>
		</div>
	);
};

export default LoadingJobListing;

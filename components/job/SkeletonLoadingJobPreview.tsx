import React, { FC } from "react";

const SkeletonLoadingJobPreview: FC = () => {
	return (
		<article className="w-full sticky p-5 border-[1px] max-w-[50rem] border-slate-300 bg-white rounded-lg">
			<div className="w-full mt-1 rounded-full h-5 bg-slate-400 animate-pulse"></div>

			<div className="my-2 flex flex-col">
				<div className="w-1/2 rounded-full h-4 bg-slate-300 animate-pulse"></div>
				<div className="w-3/5 mt-2 rounded-full h-3 bg-slate-300 animate-pulse"></div>
				<div className="w-full mt-2 rounded-full h-3 bg-slate-300 animate-pulse"></div>
			</div>

			<div className="flex justify-start my-4 items-center gap-2">
				<div className="rounded-full w-1/2 h-9 bg-blue-500 animate-pulse"></div>
				<div className="rounded-full w-1/5 h-9 bg-rose-500 animate-pulse"></div>
			</div>

			<hr />

			<div className="w-2/5 mt-3 h-4 rounded-full bg-slate-400 animate-pulse"></div>
			<div className="w-[90%] mt-4 h-3 rounded-full bg-slate-300 animate-pulse"></div>
			<div className="w-full mt-2 h-3 rounded-full bg-slate-300 animate-pulse"></div>
			<div className="w-[95%] mt-2 h-3 rounded-full bg-slate-300 animate-pulse"></div>
			<div className="w-[80%] mt-2 h-3 rounded-full bg-slate-300 animate-pulse"></div>
			<div className="w-[85%] mt-2 h-3 rounded-full bg-slate-300 animate-pulse"></div>
			<div className="w-[80%] mt-2 h-3 rounded-full bg-slate-300 animate-pulse"></div>
			<div className="w-[95%] mt-2 h-3 rounded-full bg-slate-300 animate-pulse"></div>
			<div className="w-full mt-2 h-3 rounded-full bg-slate-300 animate-pulse"></div>
			<div className="w-full mt-2 h-3 rounded-full bg-slate-300 animate-pulse"></div>
			<div className="w-[90%] mt-2 h-3 rounded-full bg-slate-300 animate-pulse"></div>
			<div className="w-[85%] mt-2 h-3 rounded-full bg-slate-300 animate-pulse"></div>
			<div className="w-[87%] mt-2 h-3 rounded-full bg-slate-300 animate-pulse"></div>
			<div className="w-[95%] mt-2 h-3 rounded-full bg-slate-300 animate-pulse"></div>
			<div className="w-[95%] mt-2 h-3 rounded-full bg-slate-300 animate-pulse"></div>
			<div className="w-full mt-2 h-3 rounded-full bg-slate-300 animate-pulse"></div>
			<div className="w-[70%] mt-2 h-3 rounded-full bg-slate-300 animate-pulse"></div>
		</article>
	);
};

export default SkeletonLoadingJobPreview;

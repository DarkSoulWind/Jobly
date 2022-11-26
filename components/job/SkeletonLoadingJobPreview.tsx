import React, { FC } from "react";
import { FaHeart } from "react-icons/fa";

const SkeletonLoadingJobPreview: FC = () => {
	return (
		<article className="w-full sticky top-[5rem] p-5 border-[1px] max-w-[50rem] border-slate-300 bg-white rounded-lg">
			<div className="w-full mt-1 rounded-full h-5 bg-slate-400 animate-pulse"></div>

			<div className="my-2 flex flex-col">
				<div className="w-1/2 rounded-full h-4 bg-slate-300 animate-pulse"></div>
				<div className="w-3/5 mt-2 rounded-full h-3 bg-slate-300 animate-pulse"></div>
				<div className="w-full mt-2 rounded-full h-3 bg-slate-300 animate-pulse"></div>
			</div>

			{/* SKELETON BUTTONS */}
			<div className="flex justify-start my-4 items-center gap-2">
				<div className="rounded-full py-2 px-5 bg-blue-500 animate-pulse">
					<span className="opacity-0">Apply on website</span>
				</div>
				<div className="rounded-full py-2 px-5 bg-rose-500 animate-pulse">
					<FaHeart className="fill-black/0 h-5 w-5" />
				</div>
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

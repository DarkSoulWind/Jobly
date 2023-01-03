import React, { DetailedHTMLProps, FC, HTMLAttributes } from "react";

const SkeletonLoaderPost: FC<
	DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
> = ({ key }) => {
	return (
		<div
			key={key}
			className="top-[5rem] w-full sticky bg-white shadow-lg shadow-slate-300 rounded-lg overflow-clip border-[1px] border-slate-300"
		>
			<div className="px-4 py-1">
				<div className="h-[2rem]"></div>

				<hr />

				<div className="animate-pulse flex mt-3 justify-start items-center w-full gap-2">
					{/* DUMMY PFP */}
					<div className="aspect-square rounded-full p-[0.15rem] bg-slate-400">
						<div className="w-14 aspect-square border-2 rounded-full border-white bg-slate-400"></div>
					</div>

					{/* DUMMY USERNAME AND DATE POSTED */}
					<div className="animate-pulse w-full space-y-2">
						<div className="w-1/6 bg-slate-500 h-3 rounded-full"></div>
						<div className="w-1/5 bg-slate-400 h-3 rounded-full"></div>
					</div>
				</div>

				{/* DUMMY POST TEXT */}
				<div className="mt-4 space-y-2 animate-pulse">
					<div className="w-full h-4 bg-slate-300 rounded-full"></div>
					<div className="w-[85%] h-4 bg-slate-300 rounded-full"></div>
					<div className="w-[95%] h-4 bg-slate-300 rounded-full"></div>
					<div className="w-full h-4 bg-slate-300 rounded-full"></div>
				</div>
			</div>

			{/* DUMMY LIKE AND COMMENT COUNT */}
			<div className="px-4 mt-2">
				<div className="animate-pulse flex justify-between items-center text-xs py-2">
					<div className="w-10 h-2 bg-slate-300 rounded-full"></div>
					<div className="w-10 h-2 bg-slate-300 rounded-full"></div>
				</div>
				<hr />
			</div>

			{/* DUMMY LIKE COMMENT AND SHARE BUTTONS */}
			<div className="flex justify-around items-center py-4 px-3">
				<div className="flex gap-1 animate-pulse">
					<div className="h-5 w-5 bg-slate-400 rounded-full"></div>
					<div className="h-5 w-10 bg-slate-400 rounded-full"></div>
				</div>
				<div className="flex gap-1 animate-pulse">
					<div className="h-5 w-5 bg-slate-400 rounded-full"></div>
					<div className="h-5 w-20 bg-slate-400 rounded-full"></div>
				</div>
				<div className="flex gap-1 animate-pulse">
					<div className="h-5 w-5 bg-slate-400 rounded-full"></div>
					<div className="h-5 w-14 bg-slate-400 rounded-full"></div>
				</div>
			</div>
		</div>
	);
};

export default SkeletonLoaderPost;

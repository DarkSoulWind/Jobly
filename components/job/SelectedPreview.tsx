import { NextRouter } from "next/router";
import React, {
	DetailedHTMLProps,
	FC,
	HTMLAttributes,
	useEffect,
	useState,
} from "react";
import type { JobPreview, SiteType } from "@lib/scraper/scraper";
import SkeletonLoadingJobPreview from "@components/job/SkeletonLoadingJobPreview";
import { FaHeart } from "react-icons/fa";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "react-query";

interface SelectedPreviewProps
	extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	link: string;
	type: string;
	isSaved: boolean;
	router: NextRouter;
}

type SaveJobBody = {
	link: string;
	type: string;
	email: string;
	title: SiteType;
	employer: string;
	location: string;
	description: string;
};

const SelectedPreview: FC<SelectedPreviewProps> = ({
	link,
	router,
	type,
	isSaved,
}) => {
	const { data: sessionData, status: sessionStatus } = useSession();
	const queryClient = useQueryClient();

	const saveJobMutation = useMutation(
		(bodyData: SaveJobBody) => {
			return fetch("http://localhost:3000/api/jobs/save/add", {
				method: "POST",
				body: JSON.stringify(bodyData),
			});
		},
		{
			onSuccess: () => {
				console.log("Saved job!");
				queryClient.invalidateQueries("saved-jobs");
			},
			onError: () => {
				console.error("Unable to add to favourite jobs list");
			},
		}
	);
	// console.log("is saved:", isSaved);
	const getPreviewjobs = async () => {
		const response = await fetch("http://localhost:3000/api/jobs/preview", {
			method: "POST",
			body: JSON.stringify({ link, type }),
		});
		const data: JobPreview = await response.json();
		return data;
	};

	const { data: jobPreviewData, isFetching: isFetchingJobPreview } = useQuery(
		["job-preview", link, type],
		getPreviewjobs,
		{ refetchOnWindowFocus: false }
	);

	// need to save the job title, employer, location, description and date added
	const saveJob = async () => {
		if (sessionStatus === "unauthenticated") return router.push("/auth");

		const bodyData = {
			link,
			type,
			email: sessionData?.user?.email!,
			title: jobPreviewData?.title!,
			employer: jobPreviewData?.employer.name!,
			location: jobPreviewData?.location!,
			description: jobPreviewData?.description!,
		};

		console.log("Saving job:", JSON.stringify(bodyData));
		saveJobMutation.mutate(bodyData);
	};

	if (isFetchingJobPreview) return <SkeletonLoadingJobPreview />;

	return (
		<aside className="top-[5rem] max-h-[90vh] w-full sticky p-5 border-[1px] max-w-[50rem] border-slate-300 bg-white rounded-lg">
			<header className="text-xl max-w-[65%] font-bold z-10">
				{jobPreviewData?.title}
			</header>
			<p className="max-w-[65%]">{jobPreviewData?.employer?.name}</p>
			<p className="text-sm">{jobPreviewData?.location}</p>
			<p className="text-sm">
				{jobPreviewData?.salary} - {jobPreviewData?.employmentType}
			</p>

			<img
				className="top-4 right-4 z-0 max-w-[30%] h-auto absolute"
				src={jobPreviewData?.employer?.logo}
				alt={jobPreviewData?.employer?.name}
			/>

			<div className="flex my-3 justify-start items-center gap-2">
				<a
					className="py-2 px-5 rounded-full bg-blue-500 hover:bg-blue-600 transition-all font-semibold text-white"
					href={link}
					target="_blank"
				>
					Apply on website
				</a>

				{/* SAVE JOB BUTTON */}
				<button
					onClick={saveJob}
					className={`py-2 px-5 rounded-full h-10 transition-all font-semibold text-white ${
						isSaved
							? "bg-white border-2 border-red-300 hover:bg-red-300"
							: "bg-rose-500 hover:bg-rose-600"
					}`}
				>
					<FaHeart
						className={`h-5 w-5 ${
							isSaved ? "fill-red-500" : "fill-white"
						}`}
					/>
				</button>
			</div>

			<hr />

			<section className="my-2 max-h-[50%] overflow-clip">
				<p className="text-lg font-semibold">Full job description</p>
				<div className="h-full">{jobPreviewData?.description}</div>
			</section>
		</aside>
	);
};

export default SelectedPreview;

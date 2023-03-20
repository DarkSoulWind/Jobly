import { NextRouter } from "next/router";
import React, { FC, useCallback } from "react";
import type { JobListing, JobPreview, SiteType } from "src/lib/scraper/scraper";
import SkeletonLoadingJobPreview from "src/components/job/SkeletonLoadingJobPreview";
import { FaHeart } from "react-icons/fa";
import { useSession } from "next-auth/react";
import {
	InfiniteData,
	useMutation,
	useQuery,
	useQueryClient,
} from "react-query";
import { PRODUCTION_URL } from "@utils/url.mjs";

interface SelectedPreviewProps {
	link: string;
	type: string;
	isSaved: boolean;
	isErrorJobData: boolean;
	router: NextRouter;
	jobData:
		| InfiniteData<{
				keyword: string;
				location: string;
				distance: string;
				results: JobListing[];
				nextCursor: number;
		  }>
		| undefined;
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
	type,
	isSaved,
	isErrorJobData,
	router,
	jobData,
}) => {
	const { data: sessionData, status: sessionStatus } = useSession();
	const queryClient = useQueryClient();

	const addSaveJobMutation = useMutation(
		(bodyData: SaveJobBody) => {
			return fetch(`${PRODUCTION_URL}/api/jobs/save/add`, {
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

	const removeSaveJobMutation = useMutation(
		(body: { email: string; link: string }) => {
			return fetch(`${PRODUCTION_URL}/api/jobs/save/remove`, {
				method: "POST",
				body: JSON.stringify(body),
			});
		},
		{
			onSuccess: () => {
				console.log("Unsaved job");
				queryClient.invalidateQueries("saved-jobs");
			},
			onError: () => {
				console.error("Unable to remove from favourite jobs list");
			},
		}
	);

	const getPreviewjobs = useCallback(async () => {
		const response = await fetch(`${PRODUCTION_URL}/api/jobs/preview`, {
			method: "POST",
			body: JSON.stringify({ link, type }),
		});
		const data: JobPreview = await response.json();
		return data;
	}, [link, type]);

	const {
		data: jobPreviewData,
		isFetching: isFetchingJobPreview,
		isError,
	} = useQuery(["job-preview", link, type], getPreviewjobs, {
		refetchOnWindowFocus: false,
		// enabled: !!jobData,
	});

	// need to save the job title, employer, location, description and date added
	const handleSaveJob = async () => {
		if (sessionStatus === "unauthenticated") return router.push("/auth");

		if (!isSaved) {
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
			addSaveJobMutation.mutate(bodyData);
		} else {
			console.log("Job is already saved");
			removeSaveJobMutation.mutate({
				email: sessionData!.user!.email!,
				link,
			});
		}
	};

	if (isFetchingJobPreview) {
		return <SkeletonLoadingJobPreview />;
	}

	if (isError) {
		return (
			<div>
				<div>Sorry bro</div>
			</div>
		);
	}

	return (
		<aside className="top-[5rem] max-h-[90vh] w-full sticky p-5 border-[1px] max-w-[50rem] border-slate-300 bg-white rounded-lg">
			<header className="text-xl max-w-[65%] font-bold z-10">
				{jobPreviewData?.title}
			</header>
			<p className="max-w-[65%]">{jobPreviewData?.employer?.name}</p>
			<p className="text-sm">{jobPreviewData?.location}</p>
			<p className="text-sm">
				{jobPreviewData?.salary} 
        {/* - {jobPreviewData?.employmentType} */}
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
					rel="noreferrer"
				>
					Apply on website
				</a>

				{/* SAVE JOB BUTTON */}
				<button
					onClick={handleSaveJob}
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

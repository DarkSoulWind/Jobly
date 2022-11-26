import { NextRouter } from "next/router";
import React, {
	DetailedHTMLProps,
	FC,
	HTMLAttributes,
	useEffect,
	useState,
} from "react";
import type { JobPreview } from "@lib/scraper/scraper";
import SkeletonLoadingJobPreview from "@components/job/SkeletonLoadingJobPreview";
import { FaHeart } from "react-icons/fa";
import { useSession } from "next-auth/react";

interface SelectedPreviewProps
	extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	link: string;
	type: string;
	isSaved: boolean;
	router: NextRouter;
}

const SelectedPreview: FC<SelectedPreviewProps> = ({
	link,
	router,
	type,
	isSaved,
}) => {
	const [jobPreviewData, setJobPreviewData] = useState<JobPreview>();
	const [isLoading, setIsLoading] = useState(false);
	const { data: sessionData, status } = useSession();

	console.log("is saved:", isSaved);

	// fetch job preview data when the link changes
	useEffect(() => {
		const getJobPreview = async () => {
			setIsLoading(true);
			setJobPreviewData(undefined);
			try {
				const response = await fetch(
					"http://localhost:3000/api/jobs/preview",
					{
						method: "POST",
						body: JSON.stringify({ link, type }),
					}
				);
				const data: JobPreview = await response.json();
				setJobPreviewData(data);
			} catch (e) {
				console.error(e);
			} finally {
				setIsLoading(false);
			}
		};

		getJobPreview();
	}, [link, type]);

	// need to save the job title, employer, location, description and date added
	const saveJob = async () => {
		if (status === "unauthenticated") return router.push("/auth");

		const bodyData = {
			link,
			type,
			email: sessionData?.user?.email!,
			title: jobPreviewData?.title!,
			employer: jobPreviewData?.employer.name!,
			location: jobPreviewData?.location!,
			description: jobPreviewData?.description!,
		};

		console.log("body:", JSON.stringify(bodyData));

		const response = await fetch(
			"http://localhost:3000/api/jobs/save/add",
			{
				method: "POST",
				body: JSON.stringify(bodyData),
			}
		);

		if (!response.ok) {
			console.error("Unable to add to favourite jobs list");
			return;
		}

		const data = await response.json();
		console.log(data);
	};

	if (isLoading) return <SkeletonLoadingJobPreview />;

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
				<button className="py-2 px-5 rounded-full bg-blue-500 hover:bg-blue-600 transition-all font-semibold text-white">
					<a href={link} target="_blank">
						Apply on website
					</a>
				</button>

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

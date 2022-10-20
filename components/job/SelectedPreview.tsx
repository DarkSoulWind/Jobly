import React, {
	DetailedHTMLProps,
	FC,
	HTMLAttributes,
	useEffect,
	useState,
} from "react";
import { FaHeart } from "react-icons/fa";
import { useQuery } from "react-query";
import { JobPreview } from "../../lib/scraper/scraper";
import SkeletonLoadingJobPreview from "./SkeletonLoadingJobPreview";

interface SelectedPreviewProps
	extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	link: string;
	type: string;
}

const SelectedPreview: FC<SelectedPreviewProps> = ({ link, type }) => {
	const [jobPreviewData, setJobPreviewData] = useState<JobPreview>();
	const [isLoading, setIsLoading] = useState(false);

	// const getJobPreview = async () => {
	// 	const response = await fetch("http://localhost:3000/api/jobs/preview", {
	// 		method: "POST",
	// 		body: JSON.stringify({ link, type }),
	// 	});
	// 	const data: JobPreview = await response.json();
	// 	return data;
	// };

	useEffect(() => {
		const getJobPreview = async () => {
			setIsLoading(true);
			setJobPreviewData(undefined);
			const response = await fetch(
				"http://localhost:3000/api/jobs/preview",
				{
					method: "POST",
					body: JSON.stringify({ link, type }),
				}
			);
			const data: JobPreview = await response.json();
			setJobPreviewData(data);
			setIsLoading(false);
		};

		getJobPreview();
	}, [link, type]);

	// const {
	// 	data: jobPreviewData,
	// 	isError,
	// 	isLoading,
	// } = useQuery(["job-preview"], getJobPreview);

	if (isLoading) return <SkeletonLoadingJobPreview />;

	return (
		<article className="w-full sticky p-5 border-[1px] max-w-[50rem] border-slate-300 bg-white rounded-lg">
			<header className="text-xl font-bold">
				{jobPreviewData?.title}
			</header>
			<p>{jobPreviewData?.employer.name}</p>
			<p className="text-sm">{jobPreviewData?.location}</p>
			<p className="text-sm">
				{jobPreviewData?.salary} - {jobPreviewData?.employmentType}
			</p>

			<div className="flex my-3 justify-start items-center gap-2">
				<button className="py-2 px-5 rounded-full bg-blue-500 hover:bg-blue-600 transition-all font-semibold text-white">
					<a href={link} target="_blank">
						Apply on website
					</a>
				</button>
				<button className="py-2 px-5 rounded-full h-10 bg-rose-500 hover:bg-rose-600 transition-all font-semibold text-white">
					<FaHeart className="h-5 w-5" />
				</button>
			</div>

			<hr />

			<section className="my-2">
				<p className="text-lg font-semibold">Full job description</p>
				<div>{jobPreviewData?.description}</div>
			</section>
		</article>
	);
};

export default SelectedPreview;

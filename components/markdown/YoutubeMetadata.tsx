import { FC } from "react";
import { useQuery } from "react-query";

export interface YoutubeVideoData {
	title: string;
	author_name: string;
	author_url: string;
	type: "video";
	height: number;
	width: number;
	version: string;
	provider_name: string;
	provider_url: string;
	thumbnail_height: number;
	thumbnail_width: number;
	thumbnail_url: string;
	html: string;
}

const getVideoMetadata = async (id: string) => {
	const videoUrl: string = `https://www.youtube.com/watch?v=${id}`;
	const requestUrl: string = `https://youtube.com/oembed?url=${videoUrl}&format=json`;

	const response = await fetch(requestUrl);
	const data: YoutubeVideoData = await response.json();
	return data;
};

const YoutubeMetadata: FC<{ url: string }> = ({ url }) => {
	const getMetadata = async () => {
		const searchParams = new URLSearchParams(url.split("?")[1]);
		const id = searchParams.get("v");
		const data = await getVideoMetadata(id!);
		return data;
	};

	const { data: videoMetaData } = useQuery(
		["youtube-video-metadata", url],
		getMetadata
	);

	return (
		<a
			href={url}
			target="_blank"
			rel="noreferrer"
			className="w-full my-1 flex rounded-lg overflow-clip bg-slate-200 hover:bg-slate-300 transition-all"
		>
			<img
				src={videoMetaData?.thumbnail_url}
				className="w-28"
				alt={videoMetaData?.title}
			/>
			<div className="text-sm flex flex-col justify-center items-start px-4 space-y-[-0.1rem]">
				<p className="text-slate-500">{videoMetaData?.provider_name}</p>
				<p className="font-bold">{videoMetaData?.title}</p>
				<p className="text-slate-500">{videoMetaData?.author_name}</p>
			</div>
		</a>
	);
};

export default YoutubeMetadata;

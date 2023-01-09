import { FC, useMemo } from "react";
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

const getVideoMetadata = async (url: string) => {
	const searchParams = new URLSearchParams(url.split("?", 2)[1]);
	const id = searchParams.get("v");
	const videoUrl: string = `https://www.youtube.com/watch?v=${id}`;
	const requestUrl: string = `https://youtube.com/oembed?url=${videoUrl}&format=json`;

	const response = await fetch(requestUrl);
	const data: YoutubeVideoData = await response.json();
	return data;
};

const YoutubeMetadata: FC<{ url: string }> = ({ url }) => {
	const getMetadata = async () => {
		const data = await getVideoMetadata(url);
		return data;
	};

	const { data: videoMetaData } = useQuery(
		["youtube-video-metadata", url],
		getMetadata,
		{ refetchOnWindowFocus: false }
	);

	const videoURL = useMemo(() => {
		const id = new URLSearchParams(url.split("?")[1]).get("v");
		return `https://www.youtube.com/embed/${id}`;
	}, [url]);

	return (
		<div className="space-y-3 py-2">
			<a
				href={url}
				target="_blank"
				rel="noreferrer"
				className="w-full flex rounded-lg overflow-clip bg-slate-200 hover:bg-slate-300 transition-all"
			>
				<img
					src={videoMetaData?.thumbnail_url}
					className="w-28"
					alt={videoMetaData?.title}
				/>

				<div className="text-sm flex flex-col justify-center items-start px-4 space-y-[-0.1rem]">
					<p className="text-slate-500">
						{videoMetaData?.provider_name}
					</p>
					<p className="font-bold">{videoMetaData?.title}</p>
					<p className="text-slate-500">
						{videoMetaData?.author_name}
					</p>
				</div>
			</a>

			<iframe
				className="w-full h-full aspect-video"
				src={videoURL}
				title="YouTube video player"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
				loading="lazy"
				allowFullScreen
			>
				Loading jobly player...
			</iframe>
		</div>
	);
};

export default YoutubeMetadata;

import React, { FC, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ReactMarkdownOptions } from "react-markdown/lib/react-markdown";
import remarkGfm, { Options as GfmOptions } from "remark-gfm";
import remarkGemoji from "remark-gemoji";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
	gruvboxDark,
	gruvboxLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { HiMoon, HiSun } from "react-icons/hi2";
import YoutubeMetadata from "./YoutubeMetadata";

/**
 * Custom markdown setup
 * @param  - `children` - The markdown content to be rendered.
 * @returns A React component that renders markdown.
 */
const Markdown: FC<ReactMarkdownOptions & { disabled?: boolean }> = ({
	disabled,
	children,
	className,
}) => {
	const [usingDark, setUsingDark] = useState(true);

	if (disabled) {
		return children;
	}

	return (
		<>
			<ReactMarkdown
				className={className}
				remarkPlugins={[
					[remarkGfm, { singleTilde: false } as GfmOptions],
					[remarkGemoji],
				]}
				components={{
					img: ({ node, ...props }) => <p {...props}>{children}</p>,
					a: ({ node, ...props }) => {
						const url = new URL(props.href!);

						return (
							<>
								<a
									className="text-blue-600 hover:underline"
									target="_blank"
									{...props}
								/>

								{/* if the site is youtube and it is a video */}
								{url.origin === "https://www.youtube.com" &&
									url.searchParams.has("v") && (
										<YoutubeMetadata url={props.href!} />
									)}
							</>
						);
					},
					code: ({ node, inline, className, children, ...props }) => {
						const match = /language-(\w+)/.exec(className || "");
						return !inline && match ? (
							<>
								<button
									onClick={() => setUsingDark(!usingDark)}
									className={`p-1 rounded-lg mt-2 ${
										usingDark
											? "bg-gray-700 hover:bg-gray-600"
											: "bg-slate-200/50 hover:bg-slate-300"
									}`}
								>
									{usingDark ? (
										<HiMoon className="fill-white" />
									) : (
										<HiSun className="fill-black" />
									)}
								</button>
								<SyntaxHighlighter
									style={
										usingDark ? gruvboxDark : gruvboxLight
									}
									language={match[1]}
									PreTag="div"
									{...props}
								>
									{String(children).replace(/\n$/, "")}
								</SyntaxHighlighter>
							</>
						) : (
							<code className={className} {...props}>
								{children}
							</code>
						);
					},
				}}
			>
				{children}
			</ReactMarkdown>
		</>
	);
};

export default Markdown;

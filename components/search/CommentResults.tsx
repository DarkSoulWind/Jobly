import { NextRouter } from "next/router";
import React, { FC } from "react";
import { SearchResults } from "../../pages/search/[searchitem]";

interface CommentResultsProps {
	router: NextRouter;
	results: SearchResults;
}

const boldenPhrase = (text: string, phrase: string): JSX.Element => {
	const a = text.split(phrase);
	return (
		<p>
			{a.map((b, index) => (
				<>
					{b}
					{index !== a.length - 1 && (
						<span className="font-bold">{phrase}</span>
					)}
				</>
			))}
		</p>
	);
};

const CommentResults: FC<CommentResultsProps> = ({
	router,
	results: { comments },
}) => {
	return (
		<>
			{comments.length > 0 && (
				<p>
					{comments.length} result{comments.length === 1 ? "" : "s"}
				</p>
			)}
			{comments.map((comment, index) => (
				<button
					key={index}
					onClick={() => router.push(`/post/${comment.postID}`)}
					className="w-full flex items-start gap-3"
				>
					{boldenPhrase(
						comment.commentText,
						router.query.searchitem as string
					)}
				</button>
			))}
			{comments.length === 0 && (
				<p>
					No comment results for{" "}
					<span className="font-bold">{router.query.searchitem}</span>
					.
				</p>
			)}
		</>
	);
};

export default CommentResults;

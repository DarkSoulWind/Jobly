import { NextRouter } from "next/router";
import React, { FC } from "react";
import { SearchResults } from "../../pages/search/[searchitem]";

interface PostResultsProps {
	router: NextRouter;
	results: SearchResults;
}

const PostResults: FC<PostResultsProps> = ({ router, results: { posts } }) => {
	return (
		<>
			{posts.length > 0 && (
				<p>
					{posts.length} result{posts.length === 1 ? "" : "s"}
				</p>
			)}
			{posts.map((post, index) => (
				<button
					key={index}
					onClick={() => router.push(`/post/${post.PostID}`)}
					className="w-full flex items-start gap-3"
				>
					{post.PostText}
				</button>
			))}
			{posts.length === 0 && (
				<p>
					No post results for{" "}
					<span className="font-bold">{router.query.searchitem}</span>
					.
				</p>
			)}
		</>
	);
};

export default PostResults;

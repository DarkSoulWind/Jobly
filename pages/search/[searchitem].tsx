import { UserPreference } from "@prisma/client";
import {
	GetServerSidePropsContext,
	InferGetServerSidePropsType,
	NextPage,
} from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState } from "react";
import Footer from "@components/footer/Footer";
import Navbar from "@components/nav/Navbar";
import CommentResults from "@components/search/CommentResults";
import PostResults from "@components/search/PostResults";
import UserResults from "@components/search/UserResults";
import { prisma } from "@lib/prisma";

export interface SearchResults {
	users: {
		image: string | null;
		preferences: UserPreference | null;
		name: string;
	}[];
	posts: {
		User: {
			name: string;
		};
		PostID: number;
		PostText: string;
		Image: string | null;
	}[];
	comments: {
		PostID: number;
		CommentText: string;
	}[];
}

interface SearchPageProps {
	searchitem: string;
	results: SearchResults;
}

type Filter = "Users" | "Posts" | "Comments";

const SearchPage: NextPage<
	InferGetServerSidePropsType<typeof getServerSideProps>
> = (props) => {
	const router = useRouter();

	const filters: Filter[] = ["Users", "Posts", "Comments"];
	const [selectedFilter, setSelectedFilter] = useState<Filter>(
		(router.query.filter as Filter) ?? "Users"
	);

	return (
		<>
			<Head>
				<title>{props.searchitem} • Jobly</title>
				<meta
					name="description"
					content={`${selectedFilter} results for: ${props.searchitem}`}
				/>
			</Head>
			<Navbar searchitem={props.searchitem} />
			<div className="background"></div>

			<div className="w-full h-full">
				<div className="relative w-full h-[10rem] bg-indigo-400 flex flex-col justify-center items-center">
					<h2 className="text-3xl font-bold text-white">
						Your results for: {props.searchitem}
					</h2>

					{/* FILTERS - Users, Posts, Comments */}
					<div className="border-indigo-600 border-b-2 absolute bottom-0 w-full flex justify-around">
						{filters.map((filter, index) => (
							<button
								key={index}
								className={`py-1 px-3 transition-all duration-300 ${
									selectedFilter === filter
										? "border-b-[5px] border-indigo-600"
										: ""
								}`}
								onClick={() => {
									setSelectedFilter(filter);
									router.push({
										pathname: `/search/${props.searchitem}`,
										query: { filter },
									});
								}}
							>
								<p
									className={`text-xl font-semibold transition-all ${
										selectedFilter === filter
											? "text-white"
											: "text-indigo-200"
									} `}
								>
									{filter}
								</p>
							</button>
						))}
					</div>
				</div>

				<main className="w-full p-10">
					{/* RESULTS */}
					<div className="mt-5 flex flex-col gap-4 w-full">
						{selectedFilter === "Users" && (
							<UserResults
								results={props.results}
								router={router}
							/>
						)}
						{selectedFilter === "Posts" && (
							<PostResults
								results={props.results}
								router={router}
							/>
						)}
						{selectedFilter === "Comments" && (
							<CommentResults
								results={props.results}
								router={router}
							/>
						)}
					</div>
				</main>
			</div>
			<Footer />
		</>
	);
};

export const getServerSideProps = async (
	context: GetServerSidePropsContext
) => {
	const { searchitem } = context.query as { [key: string]: string };
	const users = await prisma.user.findMany({
		where: {
			OR: [
				{ name: { contains: searchitem } },
				{ preferences: { firstName: { contains: searchitem } } },
				{ preferences: { lastName: { contains: searchitem } } },
			],
		},
		select: {
			name: true,
			image: true,
			preferences: true,
		},
	});

	const posts = await prisma.post.findMany({
		where: {
			OR: [{ postText: { contains: searchitem } }],
		},
		select: {
			id: true,
			postText: true,
			image: true,
			user: {
				select: {
					name: true,
				},
			},
		},
	});

	const comments = await prisma.comment.findMany({
		where: {
			OR: [{ commentText: { contains: searchitem } }],
		},
		select: {
			postID: true,
			commentText: true,
		},
	});

	const results = { users, posts, comments };
	console.log(results);

	return {
		props: {
			searchitem,
			results,
		},
	};
};

export default SearchPage;

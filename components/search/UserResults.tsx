import { UserPreferences } from "@prisma/client";
import { NextRouter } from "next/router";
import React, { FC } from "react";
import { SearchResults } from "../../pages/search/[searchitem]";

interface UserResultsProps {
	router: NextRouter;
	results: SearchResults;
}

const UserResults: FC<UserResultsProps> = ({ router, results: { users } }) => {
	return (
		<>
			{users.length > 0 && (
				<p>
					{users.length} result{users.length === 1 ? "" : "s"}
				</p>
			)}
			{users.map((user, index) => (
				<button
					key={index}
					onClick={() => router.push(`/user/${user.name}`)}
					className="w-full flex items-start gap-3"
				>
					<img
						src={
							user.image ??
							"https://i.pinimg.com/736x/dd/f0/11/ddf0110aa19f445687b737679eec9cb2.jpg"
						}
						onError={(e) => {
							e.preventDefault();
							console.log("ERROR LOADING IMAGE");
							e.currentTarget.onerror = null;
							e.currentTarget.classList.add("animate-pulse");
							e.currentTarget.src =
								"https://i.pinimg.com/736x/dd/f0/11/ddf0110aa19f445687b737679eec9cb2.jpg";
						}}
						alt={user.name}
						className="w-14 h-14 rounded-full"
					/>

					<div className="flex flex-col items-start">
						<p className="text-lg font-semibold">{user.name}</p>
						<p className="font-medium">
							{user.preferences?.FirstName ?? ""}{" "}
							{user.preferences?.LastName ?? ""}
						</p>
						<p className="text-sm">{user.preferences?.Bio ?? ""}</p>
					</div>
				</button>
			))}
			{users.length === 0 && (
				<p>
					No user results for{" "}
					<span className="font-bold">{router.query.searchitem}</span>
					.
				</p>
			)}
		</>
	);
};

export default UserResults;

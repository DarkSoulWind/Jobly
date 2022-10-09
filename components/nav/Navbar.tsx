import React, { FC, useState } from "react";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import { FaComment, FaSearch, FaSuitcase, FaUsers } from "react-icons/fa";

interface NavbarProps {
	searchitem?: string;
}

const Navbar: FC<NavbarProps> = (props) => {
	const router = useRouter();
	const { data, status } = useSession();
	const [searchInput, setSearchInput] = useState(props.searchitem ?? "");

	return (
		<nav className="w-full bg-slate-50 shadow-gray-300/50 shadow-md fixed py-1 px-4 z-10 flex justify-between items-center">
			<div className="flex justify-start items-center gap-2">
				<header
					className="flex py-1 justify-start cursor-pointer items-end"
					onClick={() =>
						router.push(status === "authenticated" ? "/feed" : "/")
					}
				>
					<h1 className="font-bold text-4xl text-black">Jobly</h1>
				</header>

				{/* SEARCH BAR */}
				{status === "authenticated" && (
					<form
						autoCorrect="off"
						autoCapitalize="off"
						spellCheck={false}
						className="flex justify-start bg-slate-200/70 h-10 items-center py-2 px-5 rounded-full gap-2"
						onSubmit={(e) => {
							e.preventDefault();
							router.push(`/search/${searchInput}`);
						}}
					>
						<button type="submit">
							<FaSearch className="w-5 h-5 fill-slate-500" />
						</button>

						<input
							type="search"
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							placeholder="Search Jobly"
							className="bg-transparent outline-none font-light text-sm text-black w-[15rem] placeholder:text-slate-500"
						/>
					</form>
				)}

				<button
					onClick={() => router.push("/jobs")}
					className={`transition-all p-1 h-10 w-10 rounded-full bg-slate-200/70 focus:bg-slate-300/70 hover:bg-slate-300/70 duration-300 flex items-center justify-center ${
						router.route === "/jobs" ? "bg-slate-300/70" : ""
					}`}
				>
					<FaSuitcase />
				</button>
			</div>

			{/* SHOW USER IF USER IS AUTHENTICATED */}
			{status === "authenticated" && (
				<div className="flex justify-end items-center gap-2">
					<button
						onClick={() => router.push("/direct")}
						className={`transition-all p-1 h-10 w-10 rounded-full bg-slate-200/70 focus:bg-slate-300/70 hover:bg-slate-300/70 duration-300 flex items-center justify-center ${
							router.route.startsWith("/direct")
								? "bg-slate-300/70 "
								: ""
						}`}
					>
						<FaComment />
					</button>

					<button
						onClick={() => router.push("/connect")}
						className={`transition-all p-1 h-10 w-10 rounded-full bg-slate-200/70 focus:bg-slate-300/70 hover:bg-slate-300/70 duration-300 flex items-center justify-center  ${
							router.route.startsWith("/connect")
								? "bg-slate-300/70 "
								: ""
						}`}
					>
						<FaUsers />
					</button>

					<button
						className={`transition-all group relative h-10 w-10 ${
							router.route.startsWith(
								`/user/${data?.user?.name
									?.split(" ")
									.join("%20")}`
							)
								? "bg-slate-300/70 "
								: ""
						}`}
					>
						<img
							onError={(e) => {
								e.preventDefault();
								console.log("ERROR LOADING IMAGE");
								e.currentTarget.onerror = null;
								e.currentTarget.classList.add("animate-pulse");
								e.currentTarget.src =
									"https://i.pinimg.com/736x/dd/f0/11/ddf0110aa19f445687b737679eec9cb2.jpg";
							}}
							src={data?.user?.image ?? ""}
							className="rounded-full"
							alt="User PFP"
						/>

						{/* DROPDOWN WHEN CLICKING ON USER */}
						<div className="group-focus-within:block hidden shadow-md shadow-gray-500 absolute right-0 -bottom-40 z-10 min-w-[10rem] max-w-[30rem] bg-slate-100 text-black rounded-lg">
							<div className="flex p-2 justify-start items-center text-left gap-2">
								{/* USER PFP */}
								<img
									src={data.user?.image ?? ""}
									className="rounded-full aspect-square w-14 h-14"
									alt="PFP"
									onError={(e) => {
										e.preventDefault();
										console.log("ERROR LOADING IMAGE");
										e.currentTarget.onerror = null;
										e.currentTarget.classList.add(
											"animate-pulse"
										);
										e.currentTarget.src =
											"https://i.pinimg.com/736x/dd/f0/11/ddf0110aa19f445687b737679eec9cb2.jpg";
									}}
								/>
								<div className="overflow-ellipsis overflow-hidden whitespace-nowrap">
									<h3>{data.user?.name}</h3>
									<p>--</p>
								</div>
							</div>
							<div className="px-2">
								<button
									onClick={() =>
										router.push(`/user/${data.user?.name}`)
									}
									className="w-full mt-2 text-sm text-semibold text-blue-500 border-2 hover:bg-blue-100 transition-all border-blue-500 rounded-full"
								>
									View profile
								</button>
							</div>
							<div className="border-t-[1px] mt-3 p-2 border-slate-300 flex flex-col gap-1 items-start justify-start">
								<button
									onClick={() => {
										router.push("/jobs/saved");
									}}
									className="text-sm text-left font-normal hover:underline text-slate-700"
								>
									Saved jobs
								</button>

								<button
									onClick={() => {
										signOut({
											callbackUrl:
												"http://localhost:3000/auth/signin",
										});
									}}
									className="text-sm text-left font-normal hover:underline text-slate-700"
								>
									Sign out
								</button>
							</div>
						</div>
					</button>
				</div>
			)}
			{status === "unauthenticated" && (
				<div className="flex justify-end items-center gap-5">
					<button
						onClick={() => router.push("/auth/signin")}
						className={`transition-all text-black font-light duration-300 border-blue-800 focus:border-b-2 hover:border-b-2 ${
							router.route === "/auth/signin" ? "border-b-2" : ""
						}`}
					>
						Sign in
					</button>
					<button
						onClick={() => router.push("/auth")}
						className="transition-all text-white hover:bg-blue-700 font-semibold duration-300 bg-blue-500 rounded-full px-4 py-1"
					>
						Get started
					</button>
				</div>
			)}
		</nav>
	);
};

export default Navbar;

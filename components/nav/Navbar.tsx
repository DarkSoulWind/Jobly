import React, { FC, useState } from "react";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import { FaSearch } from "react-icons/fa";

interface NavbarProps {
	searchitem?: string;
}

const Navbar: FC<NavbarProps> = (props) => {
	const router = useRouter();
	const { data, status } = useSession();
	const [searchInput, setSearchInput] = useState(props.searchitem ?? "");

	return (
		<nav className="w-full fixed z-50 px-4 bg-gradient-to-b from-slate-500 to-transparent flex justify-between items-center">
			<div className="flex justify-start items-center gap-5">
				<header
					className="flex py-1 justify-start cursor-pointer items-end"
					onClick={() =>
						router.push(status === "authenticated" ? "/feed" : "/")
					}
				>
					<h1 className="font-bold text-4xl text-black">
						Job<span className="text-white">ly</span>
					</h1>
				</header>
				<button
					onClick={() => router.push("/jobs")}
					className={`transition-all text-white font-light duration-300 border-blue-800 focus:border-b-2 hover:border-b-2 ${
						router.route === "/jobs" ? "border-b-2" : ""
					}`}
				>
					Find a job
				</button>
				{/* SEARCH BAR */}
				{status === "authenticated" && (
					<form
						autoCorrect="off"
						autoCapitalize="off"
						spellCheck={false}
						className="flex justify-start items-center border-[1px] py-1 px-5 rounded-xl gap-2"
						onSubmit={(e) => {
							e.preventDefault();
							router.push(`/search/${searchInput}`);
						}}
					>
						<input
							type="search"
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							placeholder="Find a user, post, comment"
							className="bg-transparent outline-none text-white w-[15rem] placeholder:text-slate-200"
						/>
						<button type="submit">
							<FaSearch className="w-5 h-5 fill-white" />
						</button>
					</form>
				)}{" "}
			</div>

			{/* SHOW USER IF USER IS AUTHENTICATED */}
			{status === "authenticated" && (
				<div className="flex justify-end items-baseline gap-5">
					<button
						onClick={() => router.push("/direct")}
						className={`transition-all text-white duration-300 font-light border-blue-800 focus:border-b-2 hover:border-b-2 ${
							router.route.startsWith("/direct")
								? "border-b-2"
								: ""
						}`}
					>
						Messages
					</button>

					<button
						onClick={() => router.push("/connect")}
						className={`transition-all text-white duration-300 font-light border-blue-800 focus:border-b-2 hover:border-b-2 ${
							router.route.startsWith("/connect")
								? "border-b-2"
								: ""
						}`}
					>
						Connect
					</button>

					<button
						className={`transition-all group relative text-white font-medium duration-300 border-blue-800 focus:border-b-2 hover:border-b-2 ${
							router.route.startsWith(
								`/user/${data?.user?.name
									?.split(" ")
									.join("%20")}`
							)
								? "border-b-2"
								: ""
						}`}
					>
						{data.user?.name}
						{/* DROPDOWN WHEN CLICKING ON USER */}
						<div className="group-focus-within:block hidden shadow-md shadow-gray-500 absolute right-0 -bottom-40 z-10 w-[300%] bg-slate-100 text-black rounded-lg">
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
								<div className="overflow-ellipsis">
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
							<div className="border-t-[1px] mt-3 p-2 border-slate-300 flex flex-col items-start justify-start">
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
						className={`transition-all text-white font-light duration-300 border-blue-800 focus:border-b-2 hover:border-b-2 ${
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

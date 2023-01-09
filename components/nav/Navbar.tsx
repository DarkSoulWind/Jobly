import React, { FC, Fragment, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import { FaComment, FaSearch, FaSuitcase, FaUsers } from "react-icons/fa";
import { Menu, Transition } from "@headlessui/react";
import { HiAcademicCap, HiBriefcase, HiLogout } from "react-icons/hi";
import { PRODUCTION_URL } from "@lib/url";

interface NavbarProps {
	searchitem?: string;
}

const Navbar: FC<NavbarProps> = (props) => {
	const router = useRouter();
	const { data: sessionData, status: sessionStatus } = useSession();
	const [searchInput, setSearchInput] = useState(props.searchitem ?? "");

	return (
		<nav className="w-full bg-slate-50 shadow-gray-300/50 shadow-md fixed py-1 px-4 z-10 flex justify-between items-center">
			<div className="flex justify-start items-center gap-2">
				<header className="flex py-1 justify-start cursor-pointer items-end">
					<Link
						href={sessionStatus === "authenticated" ? "/feed" : "/"}
					>
						<h1 className="font-bold text-4xl text-black">Jobly</h1>
					</Link>
				</header>

				{/* show search bar only if authenticated */}
				{sessionStatus === "authenticated" && (
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
						router.route.startsWith("/jobs")
							? "bg-slate-300/70"
							: ""
					}`}
				>
					<FaSuitcase />
				</button>
			</div>

			{/* SHOW USER IF USER IS AUTHENTICATED */}
			{sessionStatus === "authenticated" && (
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

					{/* This is a dropdown menu that appears when the user clicks on their profile picture. */}
					<Menu>
						<Menu.Button className="rounded-full overflow-clip aspect-square h-10 w-10">
							<img
								src={sessionData?.user?.image ?? ""}
								alt={sessionData?.user?.name ?? ""}
								className="rounded-full"
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
						</Menu.Button>

						<Transition
							as={Fragment}
							enter="transition ease-out duration-100"
							enterFrom="transform opacity-0 scale-95"
							enterTo="transform opacity-100 scale-100"
							leave="transition ease-in duration-75"
							leaveFrom="transform opacity-100 scale-100"
							leaveTo="transform opacity-0 scale-95"
						>
							<Menu.Items className="absolute top-10 mt-1 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
								<div className="p-1">
									<Menu.Item>
										{({ active }) => (
											<a
												className={`${
													active
														? "bg-violet-500 text-white"
														: "text-gray-900"
												} group flex gap-2 w-full items-center transition-all duration-300 rounded-md px-2 py-2 text-sm`}
												href={`/user/${sessionData?.user?.name}`}
											>
												<HiAcademicCap className="w-5 h-5" />
												<p className="font-bold">
													{sessionData.user?.name}
												</p>
											</a>
										)}
									</Menu.Item>

									<Menu.Item>
										{({ active }) => (
											<a
												className={`${
													active
														? "bg-violet-500 text-white"
														: "text-gray-900"
												} group flex gap-2 w-full items-center transition-all duration-300 rounded-md px-2 py-2 text-sm`}
												href="/jobs/saved"
											>
												<HiBriefcase className="w-5 h-5" />
												<p>Saved jobs</p>
											</a>
										)}
									</Menu.Item>

									<Menu.Item>
										{({ active }) => (
											<button
												className={`${
													active
														? "bg-violet-500 text-white"
														: "text-gray-900"
												} group flex gap-2 w-full items-center transition-all duration-300 rounded-md px-2 py-2 text-sm`}
												onClick={() => {
													signOut({
														callbackUrl: `${PRODUCTION_URL}/auth/signin`,
													});
												}}
											>
												<HiLogout className="w-5 h-5" />
												<p>Sign out</p>
											</button>
										)}
									</Menu.Item>
								</div>
							</Menu.Items>
						</Transition>
					</Menu>
				</div>
			)}

			{sessionStatus === "unauthenticated" && (
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

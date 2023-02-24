import React, { FormEvent, Fragment, useRef, useState } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import SignInWithGoogleButton from "src/components/auth/SignInWithGoogleButton";
import Logo from "@public/images/Logo.png";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { Dialog, Transition } from "@headlessui/react";
import Markdown from "src/components/markdown/Markdown";

const Register: NextPage = () => {
	const router = useRouter();
	const emailRef = useRef<HTMLInputElement>(null);
	const usernameRef = useRef<HTMLInputElement>(null);
	const passwordRef = useRef<HTMLInputElement>(null);
	const confirmPasswordRef = useRef<HTMLInputElement>(null);
	const [errorMessage, setErrorMessage] = useState("");

	const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const email = emailRef.current?.value;
		const username = usernameRef.current?.value;
		const password = passwordRef.current?.value;
		const confirmPassword = confirmPasswordRef.current?.value;

		// if email is in the right format
		if (!email?.match(/[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+/g)) {
			setErrorMessage("Email does not match the format.");
			return;
		}
		console.log(email, "matches the format");

		// if the passwords match
		if (password !== confirmPassword) {
			setErrorMessage("Passwords dont match");
			return;
		}
		console.log("Passwords match!");

		if (!password || password.length < 8) {
			setErrorMessage(`The password must be at least 8 characters.`);
			return;
		}

		if (!username) {
			setErrorMessage("Please enter a valid username.");
			return;
		}

		try {
			console.log(
				"Posting",
				JSON.stringify({ email, username, password }, null, 4)
			);
			const response = await fetch("/api/user/add", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, username, password }),
			});

			const data = await response.json();
			if (!response.ok) {
				console.log("Error posting values");
				throw new Error(data);
			}
			console.log("Response ok,", JSON.stringify(data, null, 4));
			router.push("/auth/signin");
		} catch (error) {
			console.error(error);
			setErrorMessage("Error creating account.");
		}
	};

	return (
		<div>
			<Head>
				<title>Create an account</title>
			</Head>
			<div className="background"></div>

			<div className="flex flex-col w-screen h-screen items-center justify-start">
				<Link href="/">
					<a className="flex py-4 justify-start cursor-pointer items-end">
						<Image src={Logo} width="120px" height="180px" />
					</a>
				</Link>

				<main className="bg-white shadow-md mx-4 w-96 border-black rounded-lg p-4">
					<h2 className="font-bold text-xl">Create an account</h2>
					<SignInWithGoogleButton />

					<div className="relative mt-6">
						<hr />
						<div className="absolute -bottom-[0.6rem] w-full flex justify-center">
							<div className="bg-white px-2 text-sm">or</div>
						</div>
					</div>

					<form onSubmit={handleRegister} className="mt-4">
						<label className="font-semibold text-sm">
							Email address
						</label>
						<input
							className="w-full mt-1 rounded-lg p-2 outline-1 outline outline-slate-300"
							type="email"
							ref={emailRef}
							// pattern="/[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+/g"
							// title="Please provide an appropriate email address."
							size={64}
							maxLength={64}
							required
						/>

						<div className="mt-4">
							<label className="font-semibold text-sm">
								Username
							</label>
						</div>
						<input
							className="w-full mt-1 rounded-lg p-2 outline-1 outline outline-slate-300"
							type="text"
							ref={usernameRef}
						/>

						<div className="mt-4">
							<label className="font-semibold text-sm">
								Password
							</label>
						</div>
						<input
							className="w-full mt-1 rounded-lg p-2 outline-1 outline outline-slate-300"
							type="password"
							ref={passwordRef}
						/>

						<div className="mt-4">
							<label className="font-semibold text-sm">
								Confirm password
							</label>
						</div>
						<input
							className="w-full mt-1 rounded-lg p-2 outline-1 outline outline-slate-300"
							type="password"
							ref={confirmPasswordRef}
						/>

						<div className="w-full mt-5 flex flex-col items-center">
							<input
								type="submit"
								className="w-full py-2 bg-sky-700 hover:bg-sky-600 transition-all duration-500 cursor-pointer rounded-lg text-white font-semibold"
								value="Register"
							/>
							<p className="text-sm italic mt-2">
								Already have an account?{" "}
								<Link href="/auth/signin">
									<a className="text-sky-400 hover:underline">
										Sign in
									</a>
								</Link>
							</p>
						</div>
					</form>
				</main>
			</div>

			<Transition appear show={errorMessage !== ""} as={Fragment}>
				<Dialog
					as="div"
					className="relative z-10"
					onClose={() => setErrorMessage("")}
				>
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<div className="fixed inset-0 bg-black bg-opacity-25" />
					</Transition.Child>

					<div className="fixed inset-0 overflow-y-auto">
						<div className="flex min-h-full items-center justify-center p-4 text-center">
							<Transition.Child
								as={Fragment}
								enter="ease-out duration-300"
								enterFrom="opacity-0 scale-95"
								enterTo="opacity-100 scale-100"
								leave="ease-in duration-200"
								leaveFrom="opacity-100 scale-100"
								leaveTo="opacity-0 scale-95"
							>
								<Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
									<Dialog.Title
										as="h3"
										className="text-lg font-medium leading-6 text-gray-900"
									>
										Cannot sign up
									</Dialog.Title>
									<div className="mt-2">
										<p className="text-sm text-gray-500">
											<Markdown>{errorMessage}</Markdown>
										</p>
									</div>

									<div className="mt-4">
										<button
											type="button"
											className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
											onClick={() => setErrorMessage("")}
										>
											Ok
										</button>
									</div>
								</Dialog.Panel>
							</Transition.Child>
						</div>
					</div>
				</Dialog>
			</Transition>
		</div>
	);
};

export default Register;

import React, { FormEvent, useRef } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import SignInWithGoogleButton from "../../components/auth/SignInWithGoogleButton";
import Head from "next/head";

const Register: NextPage = () => {
	const router = useRouter();
	const emailRef = useRef<HTMLInputElement>(null);
	const usernameRef = useRef<HTMLInputElement>(null);
	const passwordRef = useRef<HTMLInputElement>(null);
	const confirmPasswordRef = useRef<HTMLInputElement>(null);

	const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const email = emailRef.current?.value;
		const username = usernameRef.current?.value;
		const password = passwordRef.current?.value;
		const confirmPassword = confirmPasswordRef.current?.value;

		// if email is in the right format
		if (!email?.match(/[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+/g)) {
			console.log("Email doesnt match the format");
			return;
		}
		console.log(email, "matches the format");

		// if the passwords match
		if (password !== confirmPassword) {
			console.log("Passwords dont match");
			return;
		}
		console.log("Passwords match!");

		if (!password || password.length < 8) {
			console.log("Make password at least 8 characters");
			return;
		}

		if (!username) {
			console.log("Enter a username");
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
		}
	};

	return (
		<div>
			<Head>
				<title>Create an account</title>
			</Head>
			<div className="background"></div>

			<div className="flex flex-col w-screen h-screen items-center justify-start">
				<div
					className="flex py-4 justify-start cursor-pointer items-end"
					onClick={() => router.push("/")}
				>
					<h1 className="font-bold text-4xl text-black">
						Job<span className="text-white">ly</span>
					</h1>
					<div className="text-xs">Jobs for you</div>
				</div>

				<main className="bg-white mt-5 border-[1px] mx-4 w-96 border-black rounded-lg p-4">
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
							className="w-full mt-1 rounded-lg border-[1px] p-2 outline-1 outline"
							type="email"
							ref={emailRef}
						/>
						<div className="mt-4">
							<label className="font-semibold text-sm">
								Username
							</label>
						</div>
						<input
							className="w-full mt-1 rounded-lg border-[1px] p-2 outline-1 outline"
							type="text"
							ref={usernameRef}
						/>
						<div className="mt-4">
							<label className="font-semibold text-sm">
								Password
							</label>
						</div>
						<input
							className="w-full mt-1 rounded-lg border-[1px] p-2 outline-1 outline"
							type="password"
							ref={passwordRef}
						/>
						<div className="mt-4">
							<label className="font-semibold text-sm">
								Confirm password
							</label>
						</div>
						<input
							className="w-full mt-1 rounded-lg border-[1px] p-2 outline-1 outline"
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
								<a
									className="text-sky-400 hover:underline"
									href="/auth/signin"
								>
									Sign in
								</a>
							</p>
						</div>
					</form>
				</main>
			</div>
		</div>
	);
};

export default Register;

import React, { FormEvent, useRef } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import SignInWithGoogleButton from "../../components/auth/SignInWithGoogleButton";
import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";

const SignIn: NextPage = () => {
	const router = useRouter();
	const emailRef = useRef<HTMLInputElement>(null);
	const passwordRef = useRef<HTMLInputElement>(null);
	const { status } = useSession();

	const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const email = emailRef.current?.value;
		const password = passwordRef.current?.value;

		// if email is in the right format
		if (!email?.match(/[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+/g)) {
			console.log("Email doesnt match the format");
			return;
		}
		console.log(email, "matches the format");

		if (password?.trim() === "") {
			console.log("Please fill in a password");
			return;
		}

		try {
			console.log(
				"Checking credentials...",
				JSON.stringify({ email, password })
			);
			const response = await fetch(
				"http://localhost:3000/api/user/signin",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email, password }),
				}
			);
			const data = await response.json();

			if (!response.ok) {
				console.log("Incorrect credentials");
				throw new Error(JSON.stringify(data));
			}
			console.log(
				"Response ok,",
				JSON.stringify(data, null, 4),
				"signing in"
			);
			const signingIn = await signIn("credentials", {
				email,
				password,
				callbackUrl: "/feed",
			});
			console.log("Signed in", signingIn);
		} catch (error) {
			console.error(error);
		}
	};

	if (status == "authenticated") router.push("/");

	return (
		<div>
			<Head>
				<title>Sign in</title>
			</Head>
			<div className="background"></div>
			<div className="flex flex-col w-screen h-screen items-center justify-start">
				<div
					className="flex py-4 justify-start cursor-pointer items-end"
					onClick={() => router.push("/")}
				>
					<h1 className="font-bold text-4xl text-black">Jobly</h1>
					<div className="text-xs">Jobs for you</div>
				</div>
				<main className="bg-white mt-5 border-[1px] w-96 mx-4 border-black rounded-lg p-4">
					<h2 className="font-bold text-xl">Sign in</h2>
					<SignInWithGoogleButton />

					<div className="relative mt-6">
						<hr />
						<div className="absolute -bottom-[0.6rem] w-full flex justify-center">
							<div className="bg-white px-2 text-sm">or</div>
						</div>
					</div>

					<form onSubmit={handleSignIn} className="mt-4">
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
								Password
							</label>
						</div>
						<input
							className="w-full mt-1 rounded-lg border-[1px] p-2 outline-1 outline"
							type="password"
							ref={passwordRef}
						/>
						<div className="w-full mt-5 flex flex-col items-center">
							<input
								type="submit"
								className="w-full py-2 bg-sky-700 hover:bg-sky-600 transition-all duration-500 cursor-pointer rounded-lg text-white font-semibold"
								value="Sign in"
							/>
							<p className="text-sm italic mt-2">
								Don't have an account?{" "}
								<Link href="/auth">
									<a className="text-sky-400 hover:underline">
										Register
									</a>
								</Link>
							</p>
						</div>
					</form>
				</main>
			</div>
		</div>
	);
};

export default SignIn;

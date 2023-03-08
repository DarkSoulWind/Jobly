"SIGNIN PAGE";

import React, { FormEvent, useRef } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import SignInWithGoogleButton from "src/components/auth/SignInWithGoogleButton";
import { signIn, useSession } from "next-auth/react";
import Logo from "@public/images/Logo.png";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { PRODUCTION_URL } from "@utils/url.mjs";
import toast, { Toaster } from "react-hot-toast";

const SignIn: NextPage = () => {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const { status: sessionStatus } = useSession();

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;

    // if email is in the right format
    if (!email?.match(/[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+/g)) {
      console.log("Email doesnt match the format");
      toast.error("Please enter a valid email");
      return;
    }
    console.log(email, "matches the format");

    if (password?.trim() === "") {
      console.log("Please fill in a password");
      toast.error("Please fill in a password");
      return;
    }

    try {
      console.log(
        "Checking credentials...",
        JSON.stringify({ email, password })
      );
      const signingIn = await signIn("credentials", {
        email,
        password,
        callbackUrl: `${PRODUCTION_URL}/feed`,
        redirect: false,
      });

      if (!signingIn?.ok) {
        const error = signingIn?.error;
        console.log(
          "file: signin.tsx~line: 50~SignIn->handleSignIn->error~error",
          error
        );
        throw signingIn?.error;
      }

      console.log("Signed in", signingIn?.status);
    } catch (error) {
      console.error(error);
      toast.error("Invalid email or password");
    }
  };

  if (sessionStatus == "authenticated") router.push("/");

  return (
    <div>
      <Head>
        <title>Sign in</title>
      </Head>

      <div className="background"></div>

      <div className="flex flex-col w-screen h-screen items-center justify-start">
        <Link href="/">
          <a className="flex py-4 justify-start cursor-pointer items-end">
            <Image src={Logo} width="120px" height="180px" />
          </a>
        </Link>

        <main className="bg-white shadow-md w-96 mx-4 border-black rounded-lg p-4">
          <h2 className="font-bold text-xl">Sign in</h2>

          <SignInWithGoogleButton />

          <div className="relative mt-6">
            <hr />
            <div className="absolute -bottom-[0.6rem] w-full flex justify-center">
              <div className="bg-white px-2 text-sm">or</div>
            </div>
          </div>

          <form onSubmit={handleSignIn} className="mt-4">
            <label className="font-semibold text-sm">Email address</label>
            <input
              className="w-full mt-1 rounded-lg p-2 outline-1 outline outline-slate-300"
              type="email"
              ref={emailRef}
              size={64}
              maxLength={64}
              required
            />

            <div className="mt-4">
              <label className="font-semibold text-sm">Password</label>
            </div>
            <input
              className="w-full mt-1 rounded-lg p-2 outline-1 outline outline-slate-300"
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
                  <a className="text-sky-400 hover:underline">Register</a>
                </Link>
              </p>
            </div>
          </form>
        </main>
      </div>

      <Toaster />
    </div>
  );
};

export default SignIn;

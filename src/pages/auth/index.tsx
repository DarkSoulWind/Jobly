"SIGNUP PAGE";

import React, { FormEvent, useRef } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import SignInWithGoogleButton from "src/components/auth/SignInWithGoogleButton";
import Logo from "@public/images/Logo.png";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";

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

    try {
      console.log(
        "Posting",
        JSON.stringify({ email, username, password, confirmPassword }, null, 4)
      );

      // VALIDATION IS DONE ON THE SERVER
      const response = await fetch(`/api/user/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password, confirmPassword }),
      });

      const data = await response.json();

      // If the response wasn't successful
      if (!response.ok) {
        console.log("Error posting values");
        console.log(
          "file: index.tsx~line: 45~Register->handleRegister~data",
          data
        );
        toast.error(data.error);
        throw new Error(data.error);
      }
      console.log("Response ok,", JSON.stringify(data, null, 4));
      router.push("/auth/signin");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
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
              <label className="font-semibold text-sm">Username</label>
            </div>
            <input
              className="w-full mt-1 rounded-lg p-2 outline-1 outline outline-slate-300"
              type="text"
              ref={usernameRef}
            />

            <div className="mt-4">
              <label className="font-semibold text-sm">Password</label>
            </div>
            <input
              className="w-full mt-1 rounded-lg p-2 outline-1 outline outline-slate-300"
              type="password"
              ref={passwordRef}
            />

            <div className="mt-4">
              <label className="font-semibold text-sm">Confirm password</label>
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
                  <a className="text-sky-400 hover:underline">Sign in</a>
                </Link>
              </p>
            </div>
          </form>
        </main>
      </div>

      <Toaster />
    </>
  );
};

export default Register;

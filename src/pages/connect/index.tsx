import { NextPage } from "next";
import React from "react";
import Navbar from "@components/nav/Navbar";
import Head from "next/head";
import { trpc } from "@utils/trpc";
import { useSession } from "next-auth/react";
import RecommendedUserListing from "@components/connect/RecommendedUserListing";
import Link from "next/link";

const ConnectPage: NextPage = () => {
  const { data: sessionData } = useSession();
  const { data: recommendedUsers } = trpc.connect.getRecommended.useQuery(
    {
      email: sessionData?.user?.email!,
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  return (
    <>
      <Head>
        <title>Connect • Jobly</title>
      </Head>
      <Navbar />
      <div className="background"></div>

      <div className="pt-[4.5rem] w-full h-full flex justify-center">
        <main className="w-[60rem] h-[55rem] border-[1px] border-slate-300 bg-white rounded-xl p-3">
          <h3 className="text-2xl font-bold">Your connections</h3>
          <div className="flex flex-col gap-4 py-2">
            {recommendedUsers?.map((user) => (
              <RecommendedUserListing user={user} />
            ))}
          </div>

          <div className="block space-y-3">
            <p className="text-center mt-5 text-gray-600">
              Your connections are tailored to the kinds of people you follow,
              the posts that you have liked and the interests you share.
            </p>
            <p className="text-center mt-5 text-gray-600">
              Don't find anybody interesting? Head to{" "}
              <Link href={`/user/${sessionData?.user?.name}`}>
                <a className="text-blue-600">your profile</a>
              </Link>{" "}
              and tell us your interests!
            </p>
          </div>
        </main>
      </div>
    </>
  );
};

export default ConnectPage;

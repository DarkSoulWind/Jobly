import { UserPreference } from "@prisma/client";
import {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState } from "react";
import Footer from "src/components/footer/Footer";
import Navbar from "src/components/nav/Navbar";
import CommentResults from "src/components/search/CommentResults";
import PostResults from "src/components/search/PostResults";
import UserResults from "src/components/search/UserResults";
import { HiDocumentText, HiUsers } from "react-icons/hi";
import { prisma } from "src/lib/prisma";
import { IconType } from "react-icons/lib";
import { HiChatBubbleBottomCenterText } from "react-icons/hi2";

const filters = ["Users", "Posts", "Comments"] as const;
type Filter = (typeof filters)[number];

const Icons: Record<Filter, IconType> = {
  Users: HiUsers,
  Posts: HiDocumentText,
  Comments: HiChatBubbleBottomCenterText,
};

const SearchPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = (props) => {
  const router = useRouter();

  const [selectedFilter, setSelectedFilter] = useState<Filter>(
    (router.query.filter as Filter) ?? "Users"
  );

  return (
    <div className="overflow-hidden w-full h-full relative">
      <Head>
        <title>{props.searchitem} • Jobly</title>
        <meta
          name="description"
          content={`${selectedFilter} results for: ${props.searchitem}`}
        />
      </Head>
      <Navbar searchitem={props.searchitem} />
      <div className="background"></div>

      <div className="w-full h-full">
        <div className="flex flex-col fixed left-0 top-[3.5rem] w-[22rem] h-full px-2 py-3 bg-white shadow-md">
          <div className="px-2">
            <div className="space-y-1">
              <p className="font-bold text-2xl">Search results for</p>

              <p className="font-light text-gray-600">{props.searchitem}</p>
            </div>

            <hr className="mt-3" />

            <p className="mt-3 text-md font-medium">Filters</p>
          </div>

          <div className="mt-2 w-full">
            {filters.map((filter, i) => {
              const IconToUse = Icons[filter];
              return (
                <button
                  key={i}
                  className={`flex justify-start items-center w-full p-2 gap-2 hover:bg-slate-100 transition-all rounded-lg ${
                    selectedFilter === filter ? "bg-slate-100" : ""
                  }`}
                  onClick={() => {
                    setSelectedFilter(filter);
                    router.push(
                      {
                        pathname: `/search/${props.searchitem}`,
                        query: { filter },
                      },
                      undefined,
                      { shallow: true }
                    );
                  }}
                >
                  <IconToUse
                    className={`p-[0.3rem] rounded-full w-9 h-9 aspect-square ${
                      selectedFilter === filter
                        ? "bg-blue-500 fill-white"
                        : "bg-slate-300 fill-black"
                    }`}
                  />
                  <p className="text-sm font-medium">{filter}</p>
                </button>
              );
            })}
          </div>
        </div>

        <main className="w-full ml-[50%] p-10">
          {/* RESULTS */}
          <div className="mt-5 flex flex-col gap-4 w-full">
            {selectedFilter === "Users" && (
              <UserResults results={props.results} router={router} />
            )}
            {selectedFilter === "Posts" && (
              <PostResults results={props.results} router={router} />
            )}
            {selectedFilter === "Comments" && (
              <CommentResults results={props.results} router={router} />
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { searchitem } = context.query as { [key: string]: string };
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: searchitem } },
        { preferences: { firstName: { contains: searchitem } } },
        { preferences: { lastName: { contains: searchitem } } },
      ],
    },
    select: {
      name: true,
      image: true,
      preferences: true,
    },
  });

  const posts = await prisma.post.findMany({
    where: {
      OR: [{ postText: { contains: searchitem } }],
    },
    select: {
      id: true,
      postText: true,
      image: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  const comments = await prisma.comment.findMany({
    where: {
      OR: [{ commentText: { contains: searchitem } }],
    },
    select: {
      postID: true,
      commentText: true,
    },
  });

  const results = { users, posts, comments };
  console.log(results);

  return {
    props: {
      searchitem,
      results,
    },
  };
};

export type SearchResults = InferGetServerSidePropsType<
  typeof getServerSideProps
>["results"];

export default SearchPage;

"PROFILE PAGE";

import type {
  NextPage,
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
} from "next";
import React, { useState, useReducer } from "react";
import { v4 as uuid } from "uuid";
import Head from "next/head";
import Navbar from "src/components/nav/Navbar";
import Footer from "src/components/footer/Footer";
import { FaCamera, FaEnvelope, FaLocationArrow } from "react-icons/fa";
import { useModal } from "src/lib/hooks/useModal";
import EditProfileModal from "src/components/modal/EditProfileModal";
import ContactDetailModal from "src/components/modal/ContactDetailModal";
import { prisma } from "src/lib/prisma";
import { Post } from "@prisma/client";
import {
  profileReducer,
  ProfileState,
  PROFILE_ACTION,
} from "src/lib/reducers/profileReducer";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useDate } from "src/lib/hooks/useDate";
import { AnimatePresence } from "framer-motion";
import Alert from "src/components/alert/Alert";
import FollowersModal from "src/components/modal/FollowersModal";
import Markdown from "src/components/markdown/Markdown";
import { PRODUCTION_URL } from "@utils/url.mjs";
import { trpc } from "@utils/trpc";
import AddUserInterestModal from "@components/modal/AddUserInterestModal";
import { Toaster } from "react-hot-toast";
import InterestsCard from "@components/profile/InterestsCard";

// INITIALISER FOR GLOBAL STATE FOR THIS COMPONENT
export const initProfileState = ({
  profile,
}: {
  profile: InferGetServerSidePropsType<typeof getServerSideProps>;
}): ProfileState => {
  return {
    ...profile,
    isFollowing: false,
    successMessage: "",
  };
};

const UserProfilePage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = (props) => {
  const router = useRouter();
  const { data: sessionData } = useSession();
  const queryClient = trpc.useContext();

  const [profileState, dispatch] = useReducer(
    profileReducer,
    { profile: props },
    initProfileState
  );

  const activities = [...props.comments!, ...props.posts!]
    .sort((a, b) => {
      if (a.datePosted < b.datePosted) return 1;
      else if (a.datePosted > b.datePosted) return -1;
      else return 0;
    })
    .slice(0, 5);

  // Your user data
  const fetchedYourData = trpc.user.getUserByEmail.useQuery(
    {
      email: sessionData?.user?.email!,
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  const fetchedFollows = trpc.follow.getByUserID.useQuery(
    { userID: props.id! },
    {
      initialData: props.followers,
      refetchOnWindowFocus: false,
    }
  );

  const { data: profileData } = trpc.user.profile.get.useQuery(
    { email: props?.email! },
    {
      refetchOnWindowFocus: false,
    }
  );

  const followMutation = trpc.follow.toggleFollow.useMutation({
    onSuccess: () => {
      queryClient.follow.getByUserID.invalidate();
    },
  });

  const fetchedUserInterests = trpc.userInterest.getByUserId.useQuery({
    userID: props.id!,
  });

  // MODALS
  const [
    editProfileModalOpen,
    ,
    toggleEditProfileModal,
  ] = useModal(false);
  const [contactModalOpen, , toggleContactModal] =
    useModal(false);
  const [followersModalOpen, , toggleFollowersModal] =
    useModal(false);
  const [followingModalOpen, , toggleFollowingModal] =
    useModal(false);
  const [
    addInterestModalOpen,
    setAddInterestModalOpen,
    toggleAddInterestModal,
  ] = useModal(false);

  // ALERTS
  const [successMessage, setSuccessMessage] = useState(
    "Profile changed successfully."
  );

  const handleFollow = async () => {
    const followerId = fetchedYourData.data?.id!;
    const followingId = props.id!;
    const alreadyFollowed =
      fetchedFollows.data!.followers.filter(
        (follow) => follow.followerId === followerId
      ).length > 0;
    console.log(JSON.stringify({ followerId, followingId, alreadyFollowed }));
    followMutation.mutate({ followerId, followingId, alreadyFollowed });
  };

  const handleChatButton = async () => {
    const body = { userid1: fetchedYourData.data?.id, userid2: props.id };
    const response = await fetch(`${PRODUCTION_URL}/api/chats/findSharedPriv`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    const data: { exists: boolean; chatid?: string } = await response.json();
    console.log("do you two share a chat?", data.exists);

    // if they dont share a chat, create a new one with them as participants
    if (!data.exists) {
      const newChatID = uuid();
      const chatname = `${fetchedYourData.data?.name} and ${props.name}`;
      await fetch(`${PRODUCTION_URL}/api/chats/create`, {
        method: "POST",
        body: JSON.stringify({
          chatid: newChatID,
          chatname,
          participants: [
            { userid: fetchedYourData.data?.id },
            { userid: props.id },
          ],
        }),
      })
        .then((response) => {
          console.log(
            "created chat with participants",
            JSON.stringify(response, null, 4)
          );
          router.push({
            pathname: "/direct",
            query: { chat: newChatID },
          });
        })
        .catch((error) => {
          console.error(error);
        });
    }
    router.push({ pathname: "/direct", query: { chat: data.chatid } });
  };

  return (
    <>
      <Head>
        <title>{profileState.name} • Jobly</title>
        <meta
          name="description"
          content={`Jobly profile for ${profileState.name}`}
        />
      </Head>

      <Navbar />

      <div className="background"></div>

      <AnimatePresence initial={false} mode="wait" onExitComplete={() => null}>
        {profileState.successMessage !== "" && (
          <Alert
            level="Success"
            message={profileState.successMessage}
            open={profileState.successMessage !== ""}
            closeAction={() =>
              dispatch({
                type: PROFILE_ACTION.SET_SUCCESS_MESSAGE,
                payload: { successMessage: "" },
              })
            }
          />
        )}
      </AnimatePresence>

      <div className="w-full pt-[4.25rem] pb-4 px-5 grid gap-3 grid-cols-2">
        {/* PROFILE CARD */}
        <section className="grid grid-cols-1 rounded-xl overflow-clip col-span-2 xl:col-span-1">
          {/* BANNER */}
          <div className="relative">
            <img
              src={
                profileData?.banner ??
                "https://swall.teahub.io/photos/small/303-3034192_default-banner-banner-jpg.jpg"
              }
              className="w-full h-full"
              alt="profile banner"
            />
            {sessionData?.user?.name === profileState.name && (
              <button className="absolute group bg-white rounded-full p-3 top-3 right-3">
                <FaCamera className="aspect-square fill-blue-500 group-hover:fill-blue-800 transition-all w-7 h-7" />
              </button>
            )}
          </div>

          <div className="bg-white relative rounded-b-xl p-5">
            <div className="absolute -top-36">
              {/* PROFILE PIC */}
              <img
                src={profileState.image ?? ""}
                className="aspect-square top-0 rounded-full w-48 border-[4px] border-white"
                alt={`${profileState.image} pfp`}
                onError={(e) => {
                  e.preventDefault();
                  console.log("ERROR LOADING IMAGE");
                  e.currentTarget.onerror = null;
                  e.currentTarget.classList.add("animate-pulse");
                  e.currentTarget.src =
                    "https://i.pinimg.com/736x/dd/f0/11/ddf0110aa19f445687b737679eec9cb2.jpg";
                }}
              />
            </div>

            <div className="mt-10">
              {/* FIRST AND LAST NAME */}
              <div className="flex justify-start items-center gap-2">
                <h2 className="font-extrabold text-2xl">
                  {`${profileData?.firstName ?? profileState.name} ${
                    profileData?.lastName ?? ""
                  }`} 
                </h2>
                {profileData?.pronouns && (
                  <p className="text-xs bg-slate-200 font-bold p-1 rounded-sm">
                    {profileData.pronouns}
                  </p>
                )}
              </div>
              {/* USERNAME */}
              <p className="font-bold">@{profileState.name}</p>
              {/* BIO */}
              <h3 className="mt-2">{profileData?.bio ?? "Empty bio"}</h3>
              {/* LOCATION AND CONTACT INFO BUTTON */}
              <p className="text-sm flex justify-start items-center gap-1 text-slate-500">
                {/* LOCATION ICON */}
                {(profileData?.city || profileData?.countryRegion) && (
                  <FaLocationArrow />
                )}
                {profileData?.city ? `${profileData.city}, ` : ""}
                {profileData?.countryRegion
                  ? `${profileData.countryRegion} • `
                  : ""}
                <button
                  className="text-blue-500 hover:underline"
                  onClick={toggleContactModal}
                >
                  Show contact info
                </button>
              </p>

              {/* FOLLOWERS AND FOLLOWING */}
              <h4 className="mt-1">
                <strong>{fetchedFollows.data?.following?.length}</strong>{" "}
                <button
                  className="hover:underline"
                  onClick={toggleFollowingModal}
                >
                  Following
                </button>{" "}
                <strong>{fetchedFollows.data?.followers?.length}</strong>{" "}
                <button
                  className="hover:underline"
                  onClick={toggleFollowersModal}
                >
                  Followers
                </button>
              </h4>

              <div className="mt-5">
                {profileState.email !== sessionData?.user?.email && (
                  // DM BUTTON AND FOLLOW BUTTON
                  <div className="flex justify-start items-center gap-2">
                    {/* DM BUTTON */}
                    <button
                      onClick={handleChatButton}
                      className="aspect-square bg-blue-500 hover:bg-blue-800 transition-all rounded-full text-white font-semibold p-3"
                    >
                      <FaEnvelope />
                    </button>

                    {/* FOLLOW BUTTON */}
                    <button
                      onClick={handleFollow}
                      disabled={followMutation.isLoading}
                      className={`${
                        fetchedFollows.data!.followers?.filter(
                          (follow) =>
                            follow.followerId === fetchedYourData.data?.id
                        ).length > 0
                          ? "bg-transparent border-2 border-blue-500 hover:bg-blue-100 disabled:bg-blue-100 text-blue-500"
                          : "bg-blue-500 disabled:bg-blue-800 hover:bg-blue-800 text-white"
                      } transition-all rounded-full font-semibold py-2 px-4`}
                    >
                      {fetchedFollows.data!.followers?.filter(
                        (follow) =>
                          follow.followerId === fetchedYourData.data?.id
                      ).length > 0
                        ? "Following"
                        : "Follow"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {profileState.email === sessionData?.user?.email && (
              // EDIT PROFILE BUTTON
              <div className="absolute top-3 right-3 flex justify-start items-center gap-3">
                <button
                  onClick={toggleEditProfileModal}
                  className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  Edit profile
                </button>
              </div>
            )}
          </div>
        </section>

        {/* RECENT ACTIVITY CARD */}
        <section className="bg-white p-5 rounded-xl overflow-clip h-full">
          <p className="text-2xl font-bold">Recent activity</p>

          <div className="mt-2 flex flex-col items-start divide-y-[1px] gap-3 w-full">
            {activities.length === 0 && <div>Such empty :(</div>}
            {activities.map((activity) => {
              function isPost(a: typeof activity): a is Post {
                return (a as Post).postText !== undefined;
              }

              return (
                <div
                  key={activity.id}
                  onClick={() =>
                    router.push(
                      `/post/${
                        isPost(activity) ? activity.id : activity.post.id
                      }`
                    )
                  }
                  className="w-full pt-1 cursor-pointer"
                >
                  <p className="text-xs text-slate-600">
                    <span className="font-semibold">{profileState.name}</span>{" "}
                    {!isPost(activity) ? "commented" : "posted"} this{" "}
                    {isPost(activity) ? (
                      ""
                    ) : (
                      <span>
                        on{" "}
                        <Markdown disabled className="font-semibold">
                          {activity.post.postText}
                        </Markdown>
                      </span>
                    )}{" "}
                    • {useDate(activity.datePosted, true)}
                  </p>
                  <div className="pt-1 flex justify-start items-start gap-3">
                    {isPost(activity) && activity.image && (
                      <img
                        src={activity.image}
                        className="max-w-[4rem] max-h-[4rem]"
                        alt={activity.postText}
                      />
                    )}

                    <Markdown disabled>
                      {isPost(activity)
                        ? activity.postText
                        : activity.commentText}
                    </Markdown>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* TODO: GET RECOMMENDATION ALGORITHM WORKING */}
        <InterestsCard
          yourID={fetchedYourData.data?.id!}
          isYourProfile={props.id === fetchedYourData.data?.id}
          fetchedUserInterests={fetchedUserInterests.data}
          toggleAddInterestModal={toggleAddInterestModal}
        />
      </div>

      {/* MODALS */}
      {/* Checks if this profile is yours */}
      {props?.id === fetchedYourData.data?.id && (
        <AddUserInterestModal
          modalOpen={addInterestModalOpen}
          closeModal={() => setAddInterestModalOpen(false)}
          yourID={fetchedYourData.data?.id!}
        />
      )}

      <EditProfileModal
        profileState={profileState}
        modalOpen={editProfileModalOpen}
        toggle={toggleEditProfileModal}
      />

      <ContactDetailModal
        modalOpen={contactModalOpen}
        toggle={toggleContactModal}
        profileState={profileState}
      />

      {/* for toasts to show up */}
      <Toaster />

      <AnimatePresence initial={false} mode="wait" onExitComplete={() => null}>
        {followingModalOpen && (
          <FollowersModal
            modalOpen={followingModalOpen}
            followers={fetchedFollows.data?.following}
            toggle={toggleFollowingModal}
          />
        )}

        {followersModalOpen && (
          <FollowersModal
            modalOpen={followersModalOpen}
            followers={fetchedFollows.data?.followers}
            toggle={toggleFollowersModal}
          />
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext<{ username: string }>
) => {
  const username = context.params?.username;

  // DO NOT INCLUDE PASSWORDS!!
  const profile = await prisma.user.findFirst({
    where: { name: username },
    select: {
      preferences: true,
      image: true,
      name: true,
      email: true,
      posts: {
        orderBy: {
          datePosted: "desc",
        },
      },
      comments: {
        include: {
          post: true,
        },
        orderBy: {
          datePosted: "desc",
        },
      },
      interests: {
        select: {
          name: true,
        },
      },
      phoneNumber: true,
      followers: {
        select: {
          followerId: true,
          follower: true,
        },
      },
      following: true,
      id: true,
      password: false,
    },
  });

  // to preserve type as we need to convert to JSON string and back
  type Props = typeof profile;
  return {
    props: { ...(JSON.parse(JSON.stringify(profile)) as Props) },
  };
};

export default UserProfilePage;

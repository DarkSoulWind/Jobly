"DIRECT MESSAGES PAGE";

import React, { useEffect, useReducer } from "react";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { HiPaperAirplane } from "react-icons/hi2";
import { useSession } from "next-auth/react";
import io from "socket.io-client";
import ChatSection from "src/components/chat/ChatSection";
import { ChatState, chatReducer } from "src/lib/reducers/chatReducer";
import Navbar from "src/components/nav/Navbar";
import {
  selectChatID,
  setChats,
  setFollows,
  setOnlineStatus,
  setSocket,
  setYourUsername,
} from "@lib/actions";
import { Chat, Participant } from "@prisma/client";
import { trpc } from "@utils/trpc";
import { Toaster } from "react-hot-toast";

// GLOBAL STATE FOR THIS PAGE
const initChatState = (selectedChatID: string): ChatState => {
  return {
    selectedChatID,
    selectedUsername: "",
    yourUsername: "",
    chats: null,
    socket: null,
    messages: [],
    follows: null,
  };
};

const DirectMessagesPage: NextPage = () => {
  const router = useRouter();
  const { data: sessionData } = useSession();
  const [chatState, dispatch] = useReducer(
    chatReducer,
    (router.query.chat as string) || "",
    initChatState
  );

  const {
    isLoading: chatFetchLoading,
    isError: chatFetchError,
    data: chatData,
  } = trpc.chat.get.useQuery(
    {
      email: sessionData?.user?.email!,
    },
    {
      refetchOnWindowFocus: false,
      onSuccess(responseData) {
        if (router.query.chat !== "") {
          dispatch(
            selectChatID({
              chatID: router.query.chat as string,
              yourUsername: sessionData?.user?.name as string,
            })
          );
        }

        // set the chats to the response data if successful and set the username
        dispatch(setChats({ chats: responseData }));
        dispatch(
          setYourUsername({
            yourUsername: sessionData?.user?.name as string,
          })
        );
      },
    }
  );

  const {} = trpc.follow.getByEmail.useQuery(
    { email: sessionData?.user?.email! },
    {
      refetchOnWindowFocus: false,
      onSuccess(response) {
        dispatch(setFollows({ follows: response }));
      },
    }
  );

  // RUNS ONCE WHEN THE PAGE LOADS
  // sets up the socket connection
  useEffect(() => {
    // setup a new socket connection and set that as the socket
    const newSocket = io("http://localhost:4000");
    dispatch(setSocket({ socket: newSocket }));

    // update online status when connected
    newSocket.emit("connected", {
      email: sessionData?.user?.email,
      socketID: newSocket.id,
    });

    if (router.query.chat) {
      newSocket.emit("join chat", router.query.chat);
    }

    // receive online status updates from the server
    newSocket.on(
      "updated online status",
      ({ name, status }: { name: string; status: boolean }) => {
        dispatch(
          setOnlineStatus({
            username: name,
            onlineStatus: status,
          })
        );
      }
    );

    // cleanup function to disconnect the new socket connection
    return () => {
      newSocket.emit("disconnecting chat", sessionData?.user?.email);
      newSocket.disconnect();
    };
  }, []);

  const handleChatClicked = (
    chat: Chat & {
      participants: (Participant & {
        user: {
          image: string;
          name: string;
          online: boolean;
        };
      })[];
    }
  ) => {
    dispatch(
      selectChatID({
        chatID: chat.id,
        yourUsername: sessionData?.user?.name as string,
      })
    );
    router.push({
      pathname: "/direct",
      query: {
        chat: chat.id,
      },
    });
    chatState.socket?.emit("join chat", chat.id);
  };

  return (
    <>
      <Head>
        <title>Direct • Jobly</title>
        <meta name="description" content="Your direct messages." />
      </Head>

      <Navbar />

      <div className="background"></div>

      <div className="pt-[4.5rem] pb-5 h-screen flex justify-center">
        <div className="rounded-lg border-[1px] border-slate-300 overflow-clip flex max-h-[90vh] w-[70vw] bg-white">
          {/* <!-- Sidebar --> */}
          <div className="bg-white border-r w-52">
            <div className="flex items-center justify-center h-14 border-b">
              <h1 className="text-lg font-semibold">Chats</h1>
            </div>
            <div className="p-2 overflow-y-scroll h-full">
              {/* <!-- Chat list --> */}
              <ul className="space-y-2 text-center">
                {chatData?.length === 0 && (
                <p className="font-bold text-slate-400">Such empty</p>
                )}

                {chatData?.map((chat) => {
                  const guy = chat.participants?.find(
                    (participant) =>
                      participant.user.name !== sessionData?.user?.name
                  );
                  return (
                    <li
                      key={chat.id}
                      onClick={() => handleChatClicked(chat)}
                      className={`${
                        guy?.chatID === chatState.selectedChatID
                          ? "bg-gray-100"
                          : "bg-white"
                      } py-2 px-4 rounded-lg`}
                    >
                      <a href="#" className="flex items-center gap-2">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={guy?.user.image}
                          alt="Profile Picture"
                        />
                        <div className="flex-1">
                          <h2 className="text-sm font-semibold">
                            {guy?.user.name}
                          </h2>
                        </div>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* <!-- Chat window --> */}
          <div className="flex-1 flex flex-col">
            {/* MESSAGES CONTAINER */}
            {chatState.selectedChatID === "" ? (
              <>
                {/* // if the selected chat id is empty then show default page */}
                <div className="w-full h-full flex flex-col gap-2 justify-center items-center">
                  <div className="p-[1.5rem] aspect-square rounded-full w-[6rem] h-[6rem] border-2 border-black">
                    <HiPaperAirplane className="w-full h-full" />
                  </div>
                  <h3 className="text-2xl">Your messages</h3>
                  <p className="text-sm text-slate-500">
                    Select a chat to send private messages
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* else show the chat */}
                {/* <!-- Chat header --> */}
                <div className="flex items-center h-14 p-4 bg-white border-b">
                  <img
                    className="h-10 w-10 rounded-full object-cover mr-3"
                    src="https://picsum.photos/seed/picsum/200"
                    alt="Profile Picture"
                  />
                  <div>
                    <h2 className="text-lg font-semibold">
                      {chatState.selectedUsername}
                    </h2>
                    <p className="text-sm text-gray-500">Active now</p>
                  </div>
                </div>

                <ChatSection chatState={chatState} dispatch={dispatch} />
              </>
            )}
          </div>
        </div>
      </div>
      <Toaster />
    </>
  );
};

export default DirectMessagesPage;

import React, {
  FC,
  FormEvent,
  useState,
  useRef,
  Dispatch,
  Fragment,
  SetStateAction,
} from "react";
// import MessageComponent from "./Message";
import { ChatState, Action, Message } from "src/lib/reducers/chatReducer";
import { useRouter } from "next/router";
import useChatSection from "src/lib/hooks/useChatSection";
import { useQuery } from "react-query";
import { CHAT_ACTION } from "src/lib/actions/types/chat";
import { z } from "zod";
import { PRODUCTION_URL } from "@utils/url.mjs";
import { useDate } from "@lib/hooks/useDate";
import toast from "react-hot-toast";

const TextBody = z.string({ required_error: "Text body is empty." }).max(280, {
  message: "Message must be 280 characters or less.",
});

interface ChatSectionProps {
  chatState: ChatState;
  dispatch: Dispatch<Action>;
}

const fetchMessages = async (chatID: string) => {
  const response = await fetch(`${PRODUCTION_URL}/api/messages/${chatID}`);
  const responseData: Message[] = await response.json();

  if (!response.ok) throw new Error(JSON.stringify(responseData, null, 4));

  return responseData;
};

/* This is the main chat section. It holds all the messages and the input box to send messages. */
const ChatSection: FC<ChatSectionProps> = ({ chatState, dispatch }) => {
  const router = useRouter();
  const [textInput, setTextInput] = useState("");
  const [personTyping, setPersonTyping] = useState("");
  const scrollDummyRef = useRef<HTMLDivElement>(null);

  const { isFetching: isFetchingMessages } = useQuery(
    ["chat-messages", chatState.selectedChatID],
    () => fetchMessages(chatState.selectedChatID),
    {
      refetchOnWindowFocus: false,
      onSuccess(responseData) {
        dispatch({
          type: CHAT_ACTION.SET_MESSAGES,
          payload: { messages: responseData },
        });
      },
    }
  );

  // Check to see if you are part of the chat
  // if not, redirect to 404 page
  if (
    chatState.chats &&
    !chatState.chats.find((chat) => chat.id === chatState.selectedChatID)
  ) {
    router.push("/404");
  }

  useChatSection(chatState, dispatch, scrollDummyRef, setPersonTyping);

  // the send message form is submitted
  const sendMessage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (textInput.trim() === "") return;
    const validResults = TextBody.safeParse(textInput);
    console.log("VALIDATION RESULTS", validResults);

    if (!validResults.success) {
      const formatted = validResults.error.format();
      console.log(formatted);
      toast.error(formatted._errors.join(", "));
      return;
    }

    const messageData = {
      senderUsername: chatState.yourUsername,
      chatID: chatState.selectedChatID,
      text: textInput,
    };
    chatState.socket?.emit("sent message", messageData);
    setTextInput("");
  };

  // return (
  //   <>
  //     <div className="bg-white flex flex-col h-auto max-h-[calc(100%-7rem)] row-start-2 row-end-3 relative">
  //       <div className="flex flex-col h-[calc(100%-7rem)] justify-start px-3 overflow-y-auto">
  //         {/* push all the messages to the bottom */}
  //         <div className="mt-auto"></div>

  //         {/* ALL THE MESSAGES */}
  //         <div className="flex flex-col gap-2">
  //           {chatState.messages?.map((message, index) => {
  //             return (
  //               <Fragment key={message.id}>
  //                 {/* check if the dates are different, and separate the messages if they are */}
  //                 {new Date(message.datePosted).getDate() !==
  //                   new Date(
  //                     chatState.messages[index - 1]?.datePosted
  //                   )?.getDate() && (
  //                   <div className="w-full py-4 text-indigo-800 flex justify-center items-center">
  //                     <p className="text-xs">
  //                       {new Date(message.datePosted).toLocaleDateString()}
  //                     </p>
  //                   </div>
  //                 )}

  //                 <MessageComponent
  //                   key={message.id}
  //                   id={message.id}
  //                   message={message.text}
  //                   receiver={chatState.yourUsername === message.sender.name}
  //                   // check to see if the author of the message is the same as the previous message
  //                   // and they were both posted on the same date
  //                   continuing={
  //                     message.sender?.name ===
  //                       chatState.messages[index - 1]?.sender.name &&
  //                     new Date(message.datePosted).getDate() ===
  //                       new Date(
  //                         chatState.messages[index - 1].datePosted
  //                       ).getDate()
  //                   }
  //                   chatState={chatState}
  //                   pfp={message.sender.image as string}
  //                   datePosted={message.datePosted}
  //                 />
  //               </Fragment>
  //             );
  //           })}
  //         </div>

  //         {personTyping && (
  //           <p className="font-bold text-sm animate-pulse">
  //             {personTyping} is typing...
  //           </p>
  //         )}

  //         {/* dummy to scroll to the bottom when you post a new message */}
  //         <div ref={scrollDummyRef}></div>
  //       </div>

  //       {/* input box to enter messages */}
  //       <form
  //         onSubmit={sendMessage}
  //         className="absolute bottom-2 w-full flex items-center rounded-br-lg bg-indigo-400 px-3 py-2"
  //       >
  //         <input
  //           className="w-full h-fit border-[1px] border-slate-300 rounded-full py-2 px-4 text-sm"
  //           type="text"
  //           placeholder="Message..."
  //           value={textInput}
  //           onChange={(e) => {
  //             setTextInput(e.target.value);
  //             chatState.socket?.emit("user typing", {
  //               chatID: chatState.selectedChatID,
  //               username: chatState.yourUsername,
  //             });
  //           }}
  //         />
  //       </form>
  //     </div>
  //   </>
  // );

  return (
    <>
      {/* <!-- Chat messages --> */}
      <div className="flex-1 focus:ring-blue-300 focus:ring-2 overflow-y-auto p-4">
        {chatState.messages.map((message, i) => {
          const isReceiver = chatState.yourUsername === message.sender.name;
          const sameSenderAsPreviousMessage =
            message.sender?.name === chatState.messages[i - 1]?.sender.name;

          return (
            <div
              className={`flex mb-2 ${
                isReceiver ? "items-end justify-end" : "items-start"
              }`}
            >
              {message.sender.name !== chatState.yourUsername && (

              <img
                className={`h-8 w-8 rounded-full object-cover mr-3 ${
                  sameSenderAsPreviousMessage ? "opacity-0" : "opacity-100"
                }`}
                src={message.sender.image!}
                alt="Profile Picture"
              />
              )}
              <div
                className={`rounded-lg group px-3 py-2 ${
                  isReceiver ? "bg-blue-500 text-white" : "bg-gray-100"
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p
                  className={`text-xs hidden group-hover:block ${
                    isReceiver ? "text-gray-300" : "text-gray-400"
                  } `}
                >
                  {useDate(new Date(message.datePosted))}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={scrollDummyRef}></div>
      </div>

      {/* <!-- Chat input --> */}
      <div className="p-4">
        <form onSubmit={sendMessage} className="flex items-center">
          <input
            className="flex-1 bg-gray-100 rounded-full py-2 px-4 mr-2"
            type="text"
            placeholder="Type a message..."
            value={textInput}
            onChange={(e) => {
              setTextInput(e.target.value);
              chatState.socket?.emit("user typing", {
                chatID: chatState.selectedChatID,
                username: chatState.yourUsername,
              });
            }}
          />
          <button className="bg-blue-500 hover:bg-blue-600 rounded-full py-2 px-4 text-white">
            Send
          </button>
        </form>
      </div>
    </>
  );
};

export default ChatSection;

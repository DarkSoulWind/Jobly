import React, {
  FC,
  FormEvent,
  useState,
  useRef,
  Dispatch,
} from "react";
import Message from "./Message";
import { ChatState, Action, MessageResponse } from "src/lib/reducers/chatReducer";
import { useRouter } from "next/router";
import useChatSection from "src/lib/hooks/useChatSection";
import { useQuery } from "react-query";
import { CHAT_ACTION } from "src/lib/actions/types/chat";
import { z } from "zod";
import { PRODUCTION_URL } from "@utils/url.mjs";
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
  const responseData: MessageResponse[] = await response.json();

  if (!response.ok) throw new Error(JSON.stringify(responseData, null, 4));

  return responseData;
};

/* This is the main chat section. It holds all the messages and the input box to send messages. */
const ChatSection: FC<ChatSectionProps> = ({ chatState, dispatch }) => {
  const router = useRouter();
  const [textInput, setTextInput] = useState("");
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

  useChatSection(chatState, dispatch, scrollDummyRef);

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
  
  return (
    <>
      {/* <!-- Chat messages --> */}
      <div className="flex-1 relative focus:ring-blue-300 focus:ring-2 overflow-y-auto p-4">
        {/* MESSAGES */}
        {chatState.messages.map((message, i) => {
          const isReceiver = chatState.yourUsername === message.sender.name;
          const sameSenderAsPreviousMessage =
            message.sender?.name === chatState.messages[i - 1]?.sender.name;
          return (
          <Message isReceiver={isReceiver} sameSenderAsPreviousMessage={sameSenderAsPreviousMessage} chatState={chatState} message={message} />
          );
        })}

        {chatState.messages.length === 0 && (
        <p className="bottom-0 absolute text-sm text-gray-400">Start the conversation by sending a message.</p>
        )}

        {/* For scrolling to the bottom when you send a new message */}
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

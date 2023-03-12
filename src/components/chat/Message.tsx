import React, { FC, Fragment } from "react";
import { ChatState } from "src/lib/reducers/chatReducer";
import { Menu, Transition } from "@headlessui/react";
import { FaEllipsisH } from "react-icons/fa";
import { HiFlag, HiTrash } from "react-icons/hi";
import { MessageResponse } from "@lib/reducers/chatReducer";
import MessageOptions from "./MessageOptions";
import { useDate } from "@lib/hooks/useDate";
import { HiEllipsisHorizontal } from "react-icons/hi2";

interface MessageProps {
  // IF YOU ARE THE ONE RECEIVING THE MESSAGE
  isReceiver: boolean;
  // whether or not to show the pfp if the message is continuing a previous message
  // by the same user
  sameSenderAsPreviousMessage: boolean;
  chatState: ChatState;
  message: MessageResponse;
}

const Message: FC<MessageProps> = (props) => {
  const unsend = async () => {
    console.log("deleted message: ", props.message);
    props.chatState.socket?.emit("deleted message", {
      id: props.message.id,
      chatID: props.chatState.selectedChatID,
    });
  };

  return (
    <div
      className={`flex mb-2 group ${
        props.isReceiver ? "items-end justify-end" : "items-start"
      }`}
    >
      {/* <MessageOptions isReceiver={props.isReceiver} message={props.message.text} unsend={unsend} /> */}
      {/* DELETE BUTTON */}
      {props.isReceiver && (
        <button onClick={unsend} className="relative p-2 hidden group-hover:block rounded-full aspect-square hover:bg-slate-100 transition-all">
          <HiTrash />
        </button>
      )}

      {/* If you are not the sender of the message, show the pfp */}
      {props.message.sender.name !== props.chatState.yourUsername && (
        <img
          className={`h-8 w-8 rounded-full object-cover mr-3 ${
            props.sameSenderAsPreviousMessage ? "opacity-0" : "opacity-100"
          }`}
          src={props.message.sender.image!}
          alt="Profile Picture"
        />
      )}

      <div
        className={`rounded-lg group px-3 py-2 ${
          props.isReceiver ? "bg-blue-500 text-white" : "bg-gray-100"
        }`}
      >
        {/* Message text */}
        <p className="text-sm">{props.message.text}</p>

        {/* Date of the message */}
        <p
          className={`text-xs hidden group-hover:block ${
            props.isReceiver ? "text-gray-100" : "text-gray-400"
          } `}
        >
          {useDate(new Date(props.message.datePosted))}
        </p>
      </div>
    </div>
  );
};

export default Message;

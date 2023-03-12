import { Dispatch, RefObject, useEffect } from "react";
import { decrypt } from "@lib/hash";
import { ChatState, Action, MessageResponse } from "@lib/reducers/chatReducer";
import { CHAT_ACTION } from "@lib/actions/types/chat";

const useChatSection = (
  chatState: ChatState,
  dispatch: Dispatch<Action>,
  scrollDummyRef: RefObject<HTMLDivElement>,
) => {
  // RUNS EVERY TIME THE CHAT IS CHANGED
  useEffect(() => {
    // handling receiving messages from the server
    chatState.socket?.on("server new message", (message: MessageResponse) => {
      // if the message belongs to that chat that you're in then it will be displayed
      if (message.chatID === chatState.selectedChatID) {
        dispatch({
          type: CHAT_ACTION.NEW_MESSAGE,
          payload: {
            newMessage: {
              ...message,
              text: decrypt(message.text.split(",").map(n => parseInt(n)), message.key!.priv.split(",").map(n => parseInt(n))),
            },
          },
        });
      }

      // scroll to the bottom if you sent the message
      setTimeout(() => {
        if (message.sender.name === chatState.yourUsername) {
          scrollDummyRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    });

    // chatState.socket?.on("user typing", (username: string) => {
    //   if (username != chatState.yourUsername) {
    //     setPersonTyping(username);
    //     setTimeout(() => {
    //       setPersonTyping("");
    //     }, 3000);
    //   }
    //   // alert(`${username} is typing`)
    // });

    // handling deleted messages
    chatState.socket?.on("server deleted message", ({ id, chatID }) => {
      // only handle message if it is in the chat that you are in
      if (chatID === chatState.selectedChatID) {
        console.log("deleted message in this chat with id", id);
        dispatch({
          type: CHAT_ACTION.DELETE_MESSAGE,
          payload: { messageID: id },
        });
      }
    });

    // unsubscribe from socket events when component is removed
    return () => {
      chatState.socket?.off("server new message");
      chatState.socket?.off("server deleted message");
    };
  }, [chatState.messages]);
};

export default useChatSection;

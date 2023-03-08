import { Dispatch, RefObject, SetStateAction, useEffect } from "react";
import { encrypt } from "src/lib/hash";
import { ChatState, Action, Message } from "src/lib/reducers/chatReducer";
import { CHAT_ACTION } from "src/lib/actions/types/chat";

const useChatSection = (
  chatState: ChatState,
  dispatch: Dispatch<Action>,
  scrollDummyRef: RefObject<HTMLDivElement>,
  setPersonTyping: Dispatch<SetStateAction<string>>
) => {
  // RUNS EVERY TIME THE CHAT IS CHANGED
  useEffect(() => {
    // handling receiving messages from the server
    chatState.socket?.on("server new message", (message: Message) => {
      // if the message belongs to that chat that you're in then it will be displayed
      if (message.chatID === chatState.selectedChatID) {
        dispatch({
          type: CHAT_ACTION.NEW_MESSAGE,
          payload: {
            newMessage: {
              ...message,
              text: encrypt(message.text, message.cipher!.key),
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

    chatState.socket?.on("user typing", (username: string) => {
      if (username != chatState.yourUsername) {
        setPersonTyping(username);
        setTimeout(() => {
          setPersonTyping("");
        }, 3000);
      }
      // alert(`${username} is typing`)
    });

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

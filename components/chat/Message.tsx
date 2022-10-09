import React, { FC } from "react";
import { FaEllipsisH } from "react-icons/fa";
import { ChatState } from "../../reducers/chatReducer";

interface MessageProps {
	// IF YOU ARE THE ONE RECEIVING THE MESSAGE
	receiver: boolean;
	// whether or not to show the pfp if the message is continuing a previous message
	// by the same user
	continuing: boolean;
	chatState: ChatState;
	id: string;
	message: string;
	pfp: string;
	datePosted: Date;
}

const Message: FC<MessageProps> = (props) => {
	const unsend = async () => {
		console.log("lol");
		props.chatState.socket?.emit("deleted message", {
			messageID: props.id,
			chatID: props.chatState.selectedChatID,
		});
	};

	return (
		<div
			className={`${
				props.receiver ? "justify-end" : "justify-start"
			} flex w-full items-end gap-2 group`}
		>
			{!props.receiver && (
				<img
					className={`w-[2rem] h-[2rem] rounded-full ${
						props.continuing ? "opacity-0 -z-50" : ""
					}`}
					src={props.pfp}
					onError={(e) => {
						e.preventDefault();
						console.log("ERROR LOADING IMAGE");
						e.currentTarget.onerror = null;
						e.currentTarget.classList.add("animate-pulse");
						e.currentTarget.src =
							"https://i.pinimg.com/736x/dd/f0/11/ddf0110aa19f445687b737679eec9cb2.jpg";
					}}
					alt="PFP"
				/>
			)}

			<div
				className={`flex items-center ${
					props.receiver ? "flex-row-reverse" : ""
				} gap-2`}
			>
				<div
					className={`${
						props.receiver ? "bg-slate-200" : ""
					} px-4 py-3 max-w-[20rem] rounded-[1.5rem] overflow-hidden text-sm whitespace-normal overflow-ellipsis border-[1px] border-slate-200`}
				>
					<p>{props.message}</p>
				</div>

				<div className="group-hover:block hidden">
					<MessageOptions
						unsend={unsend}
						receiver={props.receiver}
						message={props.message}
					/>
				</div>
			</div>
		</div>
	);
};

interface MessageOptionsProps extends React.HTMLAttributes<HTMLDivElement> {
	receiver: boolean;
	message: string;
	unsend: () => void;
}

const MessageOptions: FC<MessageOptionsProps> = (props) => {
	return (
		<button className="group relative ">
			<FaEllipsisH className="cursor-pointer fill-slate-500 hover:fill-black" />
			<div
				className={`absolute -top-10 ${
					props.receiver ? "right-0" : "left-0"
				} group-focus-within:block hidden shadow-xl rounded-xl overflow-clip shadow-black"`}
			>
				<div className="flex justify-center items-center text-white font-bold gap-2 bg-indigo-800 py-2 px-4 text-sm">
					{/* DELETE MESSAGE */}
					{props.receiver && <p onClick={props.unsend}>Unsend</p>}

					{/* COPY MESSAGE */}
					<p
						onClick={() =>
							navigator.clipboard.writeText(props.message ?? "")
						}
					>
						Copy
					</p>

					{/* REPORT MESSAGE (doesnt do anything yet) */}
					{!props.receiver && <p>Report</p>}
				</div>
			</div>
		</button>
	);
};

export default Message;

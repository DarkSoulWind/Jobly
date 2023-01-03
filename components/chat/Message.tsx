import React, { FC, Fragment } from "react";
import { ChatState } from "@lib/reducers/chatReducer";
import { Menu, Transition } from "@headlessui/react";
import { FaEllipsisH } from "react-icons/fa";
import { HiFlag, HiTrash } from "react-icons/hi";
import Markdown from "@components/markdown/Markdown";

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
	datePosted: string;
}

const Message: FC<MessageProps> = (props) => {
	const unsend = async () => {
		console.log("deleted message: ", props.message);
		props.chatState.socket?.emit("deleted message", {
			id: props.id,
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
				<Markdown
					className={`${
						props.receiver ? "bg-slate-200" : ""
					} px-4 py-3 max-w-[20rem] rounded-[1.5rem] overflow-hidden text-sm whitespace-normal overflow-ellipsis border-[1px] border-slate-200`}
				>
					{props.message}
				</Markdown>

				<div className="group-hover:block hidden relative">
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
		<Menu>
			<Menu.Button className="relative group p-2 rounded-full aspect-square hover:bg-slate-100 transition-all">
				<FaEllipsisH />
			</Menu.Button>

			<Transition
				as={Fragment}
				enter="transition ease-out duration-100"
				enterFrom="transform opacity-0 scale-95"
				enterTo="transform opacity-100 scale-100"
				leave="transition ease-in duration-75"
				leaveFrom="transform opacity-100 scale-100"
				leaveTo="transform opacity-0 scale-95"
			>
				<Menu.Items
					className={`absolute mt-1 w-56 divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none top-0 ${
						props.receiver ? "right-7" : "left-7"
					}`}
				>
					<div className="p-1">
						{props.receiver && (
							<Menu.Item>
								{({ active }) => (
									<button
										onClick={props.unsend}
										className={`${
											active
												? "bg-violet-500 text-white"
												: "text-gray-900"
										} group flex gap-2 w-full items-center transition-all duration-300 rounded-md px-2 py-2 text-sm`}
									>
										<HiTrash
											className={`w-5 h-5 ${
												active
													? "fill-white"
													: "fill-red-500"
											}`}
										/>
										<p
											className={`font-bold ${
												active
													? "text-white"
													: "text-red-500 "
											}`}
										>
											Delete
										</p>
									</button>
								)}
							</Menu.Item>
						)}

						{!props.receiver && (
							<Menu.Item>
								{({ active }) => (
									<button
										className={`${
											active
												? "bg-violet-500 text-white"
												: "text-gray-900"
										} group flex gap-2 w-full items-center transition-all duration-300 rounded-md px-2 py-2 text-sm`}
									>
										<HiFlag className="w-5 h-5" />
										<p className={`font-bold`}>Report</p>
									</button>
								)}
							</Menu.Item>
						)}
					</div>
				</Menu.Items>
			</Transition>
		</Menu>
	);
};

export default Message;

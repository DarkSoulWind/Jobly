import React, { Dispatch, FC, SetStateAction } from "react";
import {
	FaCheckCircle,
	FaTimesCircle,
	FaExclamationTriangle,
	FaInfoCircle,
	FaQuestionCircle,
} from "react-icons/fa";
import type { IconType } from "react-icons/lib";

type AlertLevel = "Success" | "Error" | "Info" | "Warning" | "Help";

interface AlertProps {
	level: AlertLevel;
	message: string;
	open: boolean;
	setOpen?: Dispatch<SetStateAction<boolean>>;
	closeAction: () => void;
}

const Alert: FC<AlertProps> = ({
	level,
	message,
	open,
	setOpen,
	closeAction = setOpen ? () => setOpen(false) : () => console.log("closing"),
}) => {
	const colours = {
		Success: {
			container: "bg-green-100 border-green-500",
			iconWrapper: "bg-green-500",
			textContentWrapper: "text-green-500",
		},
		Error: {
			container: "bg-red-100 border-red-500",
			iconWrapper: "bg-red-500",
			textContentWrapper: "text-red-500",
		},
		Info: {
			container: "bg-blue-100 border-blue-500",
			iconWrapper: "bg-blue-500",
			textContentWrapper: "text-blue-500",
		},
		Warning: {
			container: "bg-amber-100 border-amber-500",
			iconWrapper: "bg-amber-500",
			textContentWrapper: "text-amber-500",
		},
		Help: {
			container: "bg-slate-100 border-slate-500",
			iconWrapper: "bg-slate-500",
			textContentWrapper: "text-slate-500",
		},
	};

	const icons: { [key: string]: IconType } = {
		Success: FaCheckCircle,
		Error: FaTimesCircle,
		Info: FaInfoCircle,
		Warning: FaExclamationTriangle,
		Help: FaQuestionCircle,
	};

	const Icon = icons[level];

	return (
		<div>
			{open && (
				<div
					id="container"
					className={`w-full flex justify-start overflow-clip items-center rounded-xl gap-5 border-[1px] ${colours[level].container}`}
				>
					<div
						id="iconWrapper"
						className={`py-6 px-2 h-full ${colours[level].iconWrapper}`}
					>
						<Icon className="w-6 rounded-full h-6 stroke-white stroke-[2rem] fill-transparent" />
					</div>
					<div
						id="textContentWrapper"
						className="w-full tracking-tight"
					>
						<h4
							className={`text-lg font-semibold ${colours[level].textContentWrapper}`}
						>
							{level}
						</h4>
						<p className="text-sm font-light">{message}</p>
					</div>
					<FaTimesCircle
						onClick={closeAction}
						className="mr-3 mb-auto mt-3 aspect-square w-5 h-5 cursor-pointer hover:fill-slate-500 transition-all"
					/>
				</div>
			)}
		</div>
	);
};

export default Alert;

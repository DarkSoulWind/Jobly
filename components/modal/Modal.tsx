import React, { FC } from "react";
import { AnimatePresence, motion, Variants } from "framer-motion";

type ModalProps = {
	title?: string;
	open: boolean;
	children?: JSX.Element;
	confirmButton: string;
	confirmButtonAction?: () => void;
	confirmButtonColour?: string;
	confirmButtonDisabled?: boolean;
	confirmButtonDisabledText?: string;
	discardButton?: string;
	discardButtonAction?: () => void;
	discardButtonColour?: string;
};

const dropIn: Variants = {
	hidden: {
		y: "-100vh",
		opacity: 0,
	},
	visible: {
		y: "0",
		opacity: 1,
		transition: {
			duration: 0.1,
			type: "spring",
			damping: 25,
			stiffness: 500,
		},
	},
	exit: {
		y: "-100vh",
		opacity: 0,
		transition: {
			duration: 0.3,
		},
	},
};

const Modal: FC<ModalProps> = (props: ModalProps) => {
	return (
		// BACKDROP
		<motion.div
			onClick={props.discardButtonAction}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="fixed top-0 left-0 w-full h-full z-50 bg-black bg-opacity-70 flex justify-center items-center"
		>
			{/* MAIN MODAL STUFF */}
			<motion.div
				className="w-[70%] h-[70%] flex justify-center items-center"
				onClick={(e) => e.stopPropagation()}
				variants={dropIn}
				initial="hidden"
				animate="visible"
				exit="exit"
			>
				<div className="flex flex-col justify-start h-full overflow-clip w-full rounded-xl">
					<div className="rounded-t-xl p-4 bg-white">
						<h1 className="text-2xl font-medium">{props.title}</h1>
						<hr />
					</div>

					<div className="bg-white px-4 pb-4 max-h-[80%] overflow-y-auto">
						{props.children}
					</div>

					<div className="flex py-2 bg-slate-100 rounded-b-xl px-4 items-center justify-end gap-2">
						{/* OPTIONAL DISCARD BUTTON */}
						{props.discardButton && (
							<button
								onClick={props.discardButtonAction}
								className={`py-2 px-5 ${
									props.discardButtonColour ??
									"bg-red-500 hover:bg-red-700"
								} transition-all rounded-full text-white font-semibold`}
							>
								{props.discardButton}
							</button>
						)}

						{/* THE CONFIRM BUTTON */}
						<button
							onClick={props.confirmButtonAction}
							disabled={props.confirmButtonDisabled}
							className={`py-2 px-5 ${
								props.confirmButtonColour ??
								"bg-green-500 hover:bg-green-700 disabled:bg-green-700"
							} transition-all rounded-full text-white font-semibold`}
						>
							{props.confirmButtonDisabled
								? props.confirmButtonDisabledText
								: props.confirmButton}
						</button>
					</div>
				</div>
			</motion.div>
		</motion.div>
	);
};

export default Modal;

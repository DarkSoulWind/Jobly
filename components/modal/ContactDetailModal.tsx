import React, { Dispatch, FC } from "react";
import Modal from "@components/modal/Modal";
import { FaEnvelope, FaPhone } from "react-icons/fa";
import { ProfileState, Action, PROFILE_ACTION } from "@reducers/profileReducer";

interface ContactDetailModalProps {
	modalOpen: boolean;
	toggle: () => void;
	profileState: ProfileState;
	dispatch: Dispatch<Action>;
}

const ContactDetailModal: FC<ContactDetailModalProps> = ({
	modalOpen,
	toggle,
	profileState,
	dispatch,
}) => {
	return (
		<Modal
			title="Contact info"
			open={modalOpen}
			confirmButton="Close"
			confirmButtonAction={toggle}
		>
			<div>
				<div className="flex justify-start items-start gap-3">
					<FaEnvelope className="aspect-square w-7 h-7" />

					<div>
						<h3 className="font-semibold">Email</h3>

						<button
							onClick={() => {
								navigator.clipboard.writeText(
									profileState.email ?? ""
								);

								dispatch({
									type: PROFILE_ACTION.SET_SUCCESS_MESSAGE,
									payload: {
										successMessage: "Copied to clipboard!",
									},
								});
							}}
							className="text-blue-500 hover:underline"
						>
							{profileState.email}
						</button>
					</div>
				</div>

				{profileState.phoneNumber && (
					<div className="mt-4 flex justify-start items-start gap-3">
						<FaPhone className="aspect-square w-7 h-7" />

						<div>
							<h3 className="font-semibold">Phone number</h3>

							<p>
								{profileState.preferences?.phoneType}
								:&nbsp;
								<button
									onClick={() => {
										navigator.clipboard.writeText(
											profileState.phoneNumber ?? ""
										);
										dispatch({
											type: PROFILE_ACTION.SET_SUCCESS_MESSAGE,
											payload: {
												successMessage:
													"Copied to clipboard!",
											},
										});
									}}
									className="text-blue-500 hover:underline"
								>
									{profileState.phoneNumber}
								</button>
							</p>
						</div>
					</div>
				)}
			</div>
		</Modal>
	);
};

export default ContactDetailModal;

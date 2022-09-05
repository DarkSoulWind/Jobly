import React, { Dispatch, FC, SetStateAction } from "react";
import Modal from "./Modal";
import { User, UserPreferences, Posts, Follows } from "@prisma/client";
import { FaEnvelope, FaPhone } from "react-icons/fa";
import Alert from "../alert/Alert";
import { useModal } from "../../hooks/useModal";
import { ProfileState } from "../../reducers/profileReducer";
import { profile } from "console";

interface UserProfile {
	name: string;
	preferences: UserPreferences | null;
	posts: Posts[];
	followers: Follows[];
	following: Follows[];
	email: string | null;
	image: string | null;
	phoneNumber: string | null;
}

type ContactDetailModalProps = {
	modalOpen: boolean;
	toggle: () => void;
	profileState: ProfileState;
};

const ContactDetailModal: FC<ContactDetailModalProps> = ({
	modalOpen,
	toggle,
	profileState,
}) => {
	// Copy to clipboard alert
	const [copyOpen, setCopyOpen, toggleCopy] = useModal(false);

	return (
		<Modal
			title="Contact info"
			open={modalOpen as boolean}
			confirmButton="Close"
			confirmButtonAction={toggle}
		>
			<div>
				{copyOpen && (
					<div className="mb-5">
						<Alert
							level="Success"
							message="Copied to clipboard!"
							open={copyOpen as boolean}
							setOpen={
								setCopyOpen as Dispatch<SetStateAction<boolean>>
							}
						/>
					</div>
				)}
				<div className="flex justify-start items-start gap-3">
					<FaEnvelope className="aspect-square w-7 h-7" />
					<div>
						<h3 className="font-semibold">Email</h3>
						<button
							onClick={() => {
								navigator.clipboard.writeText(
									profileState.profile.email ?? ""
								);
								setCopyOpen(true);
							}}
							className="text-blue-500 hover:underline"
						>
							{profileState.profile.email}
						</button>
					</div>
				</div>
				{profileState.profile.phoneNumber && (
					<div className="mt-4 flex justify-start items-start gap-3">
						<FaPhone className="aspect-square w-7 h-7" />
						<div>
							<h3 className="font-semibold">Phone number</h3>
							<p>
								{profileState.profile.preferences?.PhoneType}
								:&nbsp;
								<button
									onClick={() => {
										navigator.clipboard.writeText(
											profileState.profile.phoneNumber ??
												""
										);
										setCopyOpen(true);
									}}
									className="text-blue-500 hover:underline"
								>
									{profileState.profile.phoneNumber}
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

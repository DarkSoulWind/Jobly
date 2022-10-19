import React, { FC } from "react";
import { ProfileState } from "../../reducers/profileReducer";
import Modal from "./Modal";

interface FollowersModalProps {
	modalOpen: boolean;
	toggle: () => void;
	profileState: ProfileState;
}

const FollowersModal: FC<FollowersModalProps> = ({
	modalOpen,
	toggle,
	profileState,
}) => {
	return (
		<Modal
			open={modalOpen}
			confirmButton="Close"
			confirmButtonAction={toggle}
			title="Followers"
		>
			<div className="space-y-2">
				{profileState.profile.followers.length === 0 && (
					<p>No followers</p>
				)}
				{profileState.profile.followers.map(
					({ follower, followerId }) => (
						<div
							key={followerId}
							className="flex items-center gap-2"
						>
							<img
								src={follower.image ?? ""}
								alt={`${follower.name} pfp`}
								className="rounded-full h-12 w-12"
								onError={(e) => {
									e.preventDefault();
									console.log("ERROR LOADING IMAGE");
									e.currentTarget.onerror = null;
									e.currentTarget.classList.add(
										"animate-pulse"
									);
									e.currentTarget.src =
										"https://i.pinimg.com/736x/dd/f0/11/ddf0110aa19f445687b737679eec9cb2.jpg";
								}}
							/>
							<div className="text-sm">
								<a
									href={`http://localhost:3000/user/${follower.name}`}
									className="font-bold hover:underline"
								>
									{follower.name}
								</a>
							</div>
						</div>
					)
				)}
			</div>
		</Modal>
	);
};

export default FollowersModal;

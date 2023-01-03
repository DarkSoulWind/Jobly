import React, { Dispatch, FC, useState } from "react";
import Modal from "@components/modal/Modal";
import {
	Action,
	ProfileState,
	PROFILE_ACTION,
} from "@lib/reducers/profileReducer";

type EditProfileModalProps = {
	modalOpen: boolean;
	profileState: ProfileState;
	dispatch: Dispatch<Action>;
	toggle: () => void;
};

const EditProfileModal: FC<EditProfileModalProps> = ({
	modalOpen,
	toggle,
	profileState,
	dispatch,
}) => {
	// USER PROFILE STATE
	const [firstName, setFirstName] = useState(
		profileState.preferences?.firstName ?? ""
	);
	const [lastName, setLastName] = useState(
		profileState.preferences?.lastName ?? ""
	);
	const [pronouns, setPronouns] = useState(
		profileState.preferences?.pronouns ?? ""
	);
	const [bio, setBio] = useState(profileState.preferences?.bio ?? "");
	const [countryRegion, setCountryRegion] = useState(
		profileState.preferences?.countryRegion ?? ""
	);
	const [postalCode, setPostalCode] = useState(
		profileState.preferences?.postalCode ?? ""
	);
	const [city, setCity] = useState(profileState.preferences?.city ?? "");
	const [school, setSchool] = useState(
		profileState.preferences?.school ?? ""
	);
	const [phoneNumber, setPhone] = useState(profileState.phoneNumber ?? "");
	const [phoneType, setPhoneType] = useState(
		profileState.preferences?.phoneType ?? ""
	);

	const handleSubmit = async () => {
		const body = {
			firstName,
			lastName,
			pronouns,
			bio,
			countryRegion,
			postalCode,
			city,
			school,
			phoneNumber,
			phoneType,
		};
		try {
			// POSTING TO api/user-preferences/update/[email]
			const response = await fetch(
				`http://localhost:3000/api/user-preferences/update/${profileState.email}`,
				{
					method: "PUT",
					body: JSON.stringify(body),
				}
			);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(JSON.stringify(data));
			}

			// update profile data
			dispatch({
				type: PROFILE_ACTION.SET_PROFILE_INFO,
				payload: { profileUpdate: body },
			});
			console.log("Updated data", JSON.stringify(data, null, 4));

			toggle();
			dispatch({
				type: PROFILE_ACTION.SET_SUCCESS_MESSAGE,
				payload: { successMessage: "Profile changed successfully." },
			});
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<Modal
			title="Edit profile"
			open={modalOpen as boolean}
			confirmButton="Save"
			confirmButtonAction={handleSubmit}
			discardButton="Cancel"
			discardButtonAction={toggle}
		>
			<form className="flex flex-col">
				<label className="text-sm">First name</label>
				<input
					type="text"
					value={firstName}
					onChange={(e) => setFirstName(e.target.value)}
					className="p-2 rounded-xl border-2 outline-1"
				/>

				<label className="text-sm mt-4">Last name</label>
				<input
					type="text"
					value={lastName}
					onChange={(e) => setLastName(e.target.value)}
					className="p-2 rounded-xl border-[2px] outline-1"
				/>

				<label className="text-sm mt-4">Pronouns</label>
				<select
					value={pronouns}
					onChange={(e) => setPronouns(e.target.value)}
					className="p-2 rounded-xl border-[2px] outline-1"
				>
					<option value="">Please select</option>
					<option value="He/Him">He/Him</option>
					<option value="She/Her">She/Her</option>
					<option value="They/Them">They/Them</option>
				</select>

				<label className="text-sm mt-4">Bio</label>
				<textarea
					value={bio}
					onChange={(e) => setBio(e.target.value)}
					className="rounded-xl p-2 h-36 outline-1 border-[2px] resize-none"
				/>

				<h3 className="text-xl mt-4">Location</h3>
				<hr />

				<label className="text-sm mt-4">Country/Region</label>
				<input
					type="text"
					value={countryRegion}
					onChange={(e) => setCountryRegion(e.target.value)}
					className="p-2 rounded-xl border-[2px] outline-1"
				/>

				<label className="text-sm mt-4">Postal code</label>
				<input
					type="text"
					value={postalCode}
					onChange={(e) => setPostalCode(e.target.value)}
					className="p-2 rounded-xl border-[2px] outline-1"
				/>

				<label className="text-sm mt-4">City</label>
				<input
					type="text"
					value={city}
					onChange={(e) => setCity(e.target.value)}
					className="p-2 rounded-xl border-[2px] outline-1"
				/>

				<h3 className="text-xl mt-4">Education</h3>
				<hr />

				<label className="text-sm mt-4">School</label>
				<input
					type="text"
					value={school}
					onChange={(e) => setSchool(e.target.value)}
					className="p-2 rounded-xl border-[2px] outline-1"
				/>

				<h3 className="text-xl mt-4">Contact info</h3>
				<hr />

				<label className="text-sm mt-4">Phone number</label>
				<input
					type="text"
					value={phoneNumber}
					onChange={(e) => setPhone(e.target.value)}
					className="p-2 rounded-xl border-[2px] outline-1"
				/>

				<label className="text-sm mt-4">Phone type</label>
				<select
					value={phoneType}
					onChange={(e) => setPhoneType(e.target.value)}
					className="p-2 rounded-xl border-[2px] outline-1"
				>
					<option value="">Please select</option>
					<option value="Home">Home</option>
					<option value="Work">Work</option>
					<option value="Mobile">Mobile</option>
				</select>
			</form>
		</Modal>
	);
};

export default EditProfileModal;

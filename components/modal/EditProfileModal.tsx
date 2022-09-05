import React, { Dispatch, FC, useState } from "react";
import Modal from "./Modal";
import {
	Action,
	ProfileState,
	PROFILE_ACTION,
} from "../../reducers/profileReducer";
import {
	UserPreferences,
	Posts,
	Follows,
	Comments,
	Interests,
} from "@prisma/client";

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
	const [FirstName, setFirstName] = useState(
		profileState.profile.preferences?.FirstName ?? ""
	);
	const [LastName, setLastName] = useState(
		profileState.profile.preferences?.LastName ?? ""
	);
	const [Pronouns, setPronouns] = useState(
		profileState.profile.preferences?.Pronouns ?? ""
	);
	const [Bio, setBio] = useState(profileState.profile.preferences?.Bio ?? "");
	const [CountryRegion, setCountryRegion] = useState(
		profileState.profile.preferences?.CountryRegion ?? ""
	);
	const [PostalCode, setPostalCode] = useState(
		profileState.profile.preferences?.PostalCode ?? ""
	);
	const [City, setCity] = useState(
		profileState.profile.preferences?.City ?? ""
	);
	const [School, setSchool] = useState(
		profileState.profile.preferences?.School ?? ""
	);
	const [Phone, setPhone] = useState(profileState.profile.phoneNumber ?? "");
	const [PhoneType, setPhoneType] = useState(
		profileState.profile.preferences?.PhoneType ?? ""
	);

	const handleSubmit = async () => {
		const body = {
			FirstName,
			LastName,
			Pronouns,
			Bio,
			CountryRegion,
			PostalCode,
			City,
			School,
			phoneNumber: Phone,
			PhoneType,
		};
		try {
			const response = await fetch(
				`http://localhost:3000/api/user-preferences/update/${profileState.profile.email}`,
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
					value={FirstName}
					onChange={(e) => setFirstName(e.target.value)}
					className="p-2 rounded-xl border-2 outline-1"
				/>

				<label className="text-sm mt-4">Last name</label>
				<input
					type="text"
					value={LastName}
					onChange={(e) => setLastName(e.target.value)}
					className="p-2 rounded-xl border-[2px] outline-1"
				/>

				<label className="text-sm mt-4">Pronouns</label>
				<select
					value={Pronouns}
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
					value={Bio}
					onChange={(e) => setBio(e.target.value)}
					className="rounded-xl p-2 h-36 outline-1 border-[2px] resize-none"
				/>

				<h3 className="text-xl mt-4">Location</h3>
				<hr />

				<label className="text-sm mt-4">Country/Region</label>
				<input
					type="text"
					value={CountryRegion}
					onChange={(e) => setCountryRegion(e.target.value)}
					className="p-2 rounded-xl border-[2px] outline-1"
				/>

				<label className="text-sm mt-4">Postal code</label>
				<input
					type="text"
					value={PostalCode}
					onChange={(e) => setPostalCode(e.target.value)}
					className="p-2 rounded-xl border-[2px] outline-1"
				/>

				<label className="text-sm mt-4">City</label>
				<input
					type="text"
					value={City}
					onChange={(e) => setCity(e.target.value)}
					className="p-2 rounded-xl border-[2px] outline-1"
				/>

				<h3 className="text-xl mt-4">Education</h3>
				<hr />

				<label className="text-sm mt-4">School</label>
				<input
					type="text"
					value={School}
					onChange={(e) => setSchool(e.target.value)}
					className="p-2 rounded-xl border-[2px] outline-1"
				/>

				<h3 className="text-xl mt-4">Contact info</h3>
				<hr />

				<label className="text-sm mt-4">Phone number</label>
				<input
					type="text"
					value={Phone}
					onChange={(e) => setPhone(e.target.value)}
					className="p-2 rounded-xl border-[2px] outline-1"
				/>

				<label className="text-sm mt-4">Phone type</label>
				<select
					value={PhoneType}
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

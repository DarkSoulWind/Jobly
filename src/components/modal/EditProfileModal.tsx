import React, { Dispatch, FC, FormEvent, Fragment, useState } from "react";
import {
  ProfileState,
} from "src/lib/reducers/profileReducer";
import { Dialog, Transition } from "@headlessui/react";
import { trpc } from "@utils/trpc";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

type EditProfileModalProps = {
  modalOpen: boolean;
  profileState: ProfileState;
  toggle: () => void;
};

const EditProfileModal: FC<EditProfileModalProps> = ({
  modalOpen,
  toggle,
  profileState,
}) => {
  const queryClient = trpc.useContext();
  const { data: sessionData } = useSession();

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
  const [school, setSchool] = useState(profileState.preferences?.school ?? "");
  const [phoneNumber, setPhone] = useState(profileState.phoneNumber ?? "");
  const [phoneType, setPhoneType] = useState(
    profileState.preferences?.phoneType ?? ""
  );

  const profileMutation = trpc.user.profile.update.useMutation({
    onSuccess: () => {
      queryClient.user.profile.get.invalidate();
      toast.success("Profile updated!");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Error updating profile.");
    },
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const email = sessionData?.user?.email!;
    profileMutation.mutate({
      email,
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
    });
    toggle();
  };

  return (
    <>
      <Transition appear show={modalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={toggle}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-3/5 h-[30rem] transform rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Edit profile
                  </Dialog.Title>

                  <form
                    className="flex flex-col h-full py-4"
                    onSubmit={handleSubmit}
                  >
                    <div className="flex flex-col h-full overflow-y-scroll pr-4">
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
                        rows={10}
                        className="rounded-xl px-2 py-4 h-[5rem] outline-1 border-[2px]"
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
                        type="tel"
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
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        role="button"
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 transition-all"
                        onClick={toggle}
                      >
                        Cancel
                      </button>
                      <input
                        type="submit"
                        role="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      />
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default EditProfileModal;

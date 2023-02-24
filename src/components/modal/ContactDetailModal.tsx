import React, { FC, Fragment } from "react";
import { HiEnvelope, HiPhone } from "react-icons/hi2";
import { ProfileState } from "src/lib/reducers/profileReducer";
import toast from "react-hot-toast";
import { Dialog, Transition } from "@headlessui/react";

interface ContactDetailModalProps {
  modalOpen: boolean;
  toggle: () => void;
  profileState: ProfileState;
}

const ContactDetailModal: FC<ContactDetailModalProps> = ({
  modalOpen,
  toggle,
  profileState,
}) => {
  return (
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Contact info
                </Dialog.Title>

                <div>
                  <div className="flex justify-start mt-3 items-start gap-3">
                    <HiEnvelope className="aspect-square w-7 h-7" />

                    <div>
                      <h3 className="font-semibold">Email</h3>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            profileState.email ?? ""
                          );

                          toast.success("Copied to clipboard!", { icon: "📋" });
                        }}
                        className="text-blue-500 hover:underline"
                      >
                        {profileState.email}
                      </button>
                    </div>
                  </div>

                  {profileState.phoneNumber && (
                    <div className="mt-4 flex justify-start items-start gap-3">
                      <HiPhone className="aspect-square w-7 h-7" />

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

                              toast.success("Copied to clipboard!", {
                                icon: "📋",
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

                <div className="mt-4">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={toggle}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ContactDetailModal;

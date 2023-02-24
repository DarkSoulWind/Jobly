import { Combobox, Dialog, Transition } from "@headlessui/react";
import { trpc } from "@utils/trpc";
import React, { FC, FormEvent, Fragment, useState } from "react";
import toast from "react-hot-toast";
import { HiCheck } from "react-icons/hi";
import { HiChevronUpDown } from "react-icons/hi2";

interface AddUserInterestModalProps {
  modalOpen: boolean;
  closeModal: () => void;
  yourID: string;
}

const AddUserInterestModal: FC<AddUserInterestModalProps> = ({
  modalOpen,
  closeModal,
  yourID,
}) => {
  const queryClient = trpc.useContext();
  const [query, setQuery] = useState("");

  const { data: interests, isLoading: loadingInterests } =
    trpc.interest.filter.useQuery(
      { query },
      {
        refetchOnWindowFocus: false,
      }
    );

  const [selected, setSelected] = useState(
    loadingInterests ? null : interests ? interests[0] : null
  );

  const { isLoading: addUserInterestLoading, mutate: addUserInterestMutate } =
    trpc.userInterest.add.useMutation({
      onSuccess: () => {
        queryClient.userInterest.getByUserId.invalidate();
        closeModal();
        toast.success("Added interest!");
      },
      onError: (error) => {
        console.error(error);
        toast.error("Error adding interest.");
      },
    });

  const addUserInterest = (e: FormEvent<HTMLFormElement>) => {
    const userID = yourID;
    const name = selected?.name!;
    console.log(
      "file: AddUserInterestModal.tsx~line: 46~AddUserInterestModal->addUserInterest->name~name",
      name
    );
    console.log(
      "file: AddUserInterestModal.tsx~line: 20~AddUserInterestModal->query~query",
      query
    );
    e.preventDefault();
    addUserInterestMutate({
      userID,
      name,
    });
  };

  return (
    <Transition appear show={modalOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10 overflow-visible" onClose={closeModal}>
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

        <div className="fixed inset-0 overflow-y-auto overflow-visible">
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
              <Dialog.Panel className="w-full max-w-md transform rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Add interest
                </Dialog.Title>

                <form onSubmit={addUserInterest} className="mt-4">
                  <Combobox value={selected} onChange={setSelected}>
                    <div className="relative mt-1 z-[100]">
                      <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
                        <Combobox.Input
                          className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                          autoComplete="off"
                          onChange={(event) => setQuery(event.target.value)}
                          displayValue={(interest) => interest?.name ?? ""}
                        />

                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                          <HiChevronUpDown
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </Combobox.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                        afterLeave={() => setQuery("")}
                      >
                        <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          {interests?.length === 0 && query !== "" ? (
                            <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                              Nothing found.
                            </div>
                          ) : (
                            interests?.map((interest) => (
                              <Combobox.Option
                                key={interest.name}
                                className={({ active }) =>
                                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                    active
                                      ? "bg-teal-600 text-white"
                                      : "text-gray-900"
                                  }`
                                }
                                value={interest}
                              >
                                {({ selected, active }) => (
                                  <>
                                    <span
                                      className={`block truncate ${
                                        selected ? "font-medium" : "font-normal"
                                      }`}
                                    >
                                      {interest.name}
                                    </span>
                                    {selected ? (
                                      <span
                                        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                          active
                                            ? "text-white"
                                            : "text-teal-600"
                                        }`}
                                      >
                                        <HiCheck
                                          className="h-5 w-5"
                                          aria-hidden="true"
                                        />
                                      </span>
                                    ) : null}
                                  </>
                                )}
                              </Combobox.Option>
                            ))
                          )}
                        </Combobox.Options>
                      </Transition>
                    </div>
                  </Combobox>

                  <div className="mt-4 flex gap-2">
                    <button
                      role="button"
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 transition-all"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <input
                      type="submit"
                      disabled={addUserInterestLoading}
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all cursor-pointer"
                    />
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AddUserInterestModal;

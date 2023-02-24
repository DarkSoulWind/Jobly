import { trpc } from "@utils/trpc";
import React, { FC } from "react";
import { HiXMark } from "react-icons/hi2";
import toast from "react-hot-toast";

interface InterestProps {
  name: string;
  yourID: string;
  isYourProfile: boolean;
}

const Interest: FC<InterestProps> = ({ name, yourID, isYourProfile }) => {
  const queryClient = trpc.useContext();

  const deleteUserInterestMutation = trpc.userInterest.delete.useMutation({
    onSuccess: () => {
      queryClient.userInterest.invalidate();
      toast.success("Removed interest!");
    },
    onError: () => {
      toast.error("Error removing interest.");
    },
  });

  const deleteUserInterest = () => {
    const userID = yourID;
    deleteUserInterestMutation.mutate({ name, userID });
  };

  return (
    <div
      key={name}
      className="bg-indigo-500 group flex justify-center items-center h-10 gap-1 py-2 px-4 rounded-lg"
    >
      <p className="text-sm font-medium text-white">{name}</p>

      {/* Only show the delete button if you are on your profile */}
      {isYourProfile && (
        <button
          disabled={deleteUserInterestMutation.isLoading}
          onClick={deleteUserInterest}
        >
          <HiXMark className="group-hover:block hidden fill-white/60 disabled:fill-white/60 hover:fill-white w-6 h-6 transition-all" />
        </button>
      )}
    </div>
  );
};

export default Interest;

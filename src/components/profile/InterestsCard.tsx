import Interest from "@components/interest/Interest";
import { UserInterest } from "@prisma/client";
import React, { FC } from "react";

interface InterestsCardProps {
  isYourProfile: boolean;
  fetchedUserInterests: UserInterest[] | undefined;
  yourID: string;
  toggleAddInterestModal: () => void;
}

const InterestsCard: FC<InterestsCardProps> = ({
  yourID,
  isYourProfile,
  fetchedUserInterests,
  toggleAddInterestModal,
}) => {
  return (
    <section className="bg-white p-5 rounded-xl overflow-clip h-full">
      <p className="text-2xl font-bold">Interests</p>

      <div className="mt-2 flex flex-wrap gap-3 items-center w-full">
        {fetchedUserInterests?.length === 0 && <div>Such empty</div>}

        {fetchedUserInterests?.map(({ name }) => (
          <Interest name={name} yourID={yourID} isYourProfile={isYourProfile} />
        ))}

        {/* Checks if this profile is yours before showing the add interest button */}
        {isYourProfile && (
          <button
            onClick={toggleAddInterestModal}
            className="inline-flex justify-center rounded-md border border-transparent bg-green-100 px-4 py-2 text-sm font-medium text-green-900 hover:bg-green-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
          >
            Add interest
          </button>
        )}
      </div>
    </section>
  );
};

export default InterestsCard;

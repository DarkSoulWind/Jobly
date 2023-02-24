import { UserPreference } from '@prisma/client';
import Link from 'next/link';
import React, { FC } from 'react'
import { HiOutlineChatBubbleBottomCenterText } from 'react-icons/hi2';

interface RecommendedUserListingProps {
  user: {
    id: string;
    name: string;
    image: string;
    preferences: UserPreference | null;
    recommendationReason: string | undefined;
  };
}

const RecommendedUserListing: FC<RecommendedUserListingProps> = ({ user }) => {
  return (
    <div className="flex justify-between items-center" key={user.id}>
      <div className="flex items-center gap-4">
        <div className="w-14 h-14">
          <img
            className="rounded-full"
            alt="pfp"
            onError={(e) => {
              e.preventDefault();
              console.log("ERROR LOADING IMAGE");
              e.currentTarget.onerror = null;
              e.currentTarget.classList.add("animate-pulse");
              e.currentTarget.src =
                "https://i.pinimg.com/736x/dd/f0/11/ddf0110aa19f445687b737679eec9cb2.jpg";
            }}
            src={user.image}
          />
        </div>

        <div>
          {user.recommendationReason && (
            <div className="flex items-center justify-start gap-2">
              <HiOutlineChatBubbleBottomCenterText className="w-5 h-5"/>
              <p className="font-sm font-semibold">
                {user.recommendationReason}
              </p>
            </div>
          )}
          <p className="font-bold text-lg">{user.name}</p>
          <p className="text-sm">{user.preferences?.bio}</p>
        </div>
      </div>

      <Link href={`/user/${user.name}`}>
        <a className="py-1 px-4 rounded-full hover:bg-blue-100 transition-all text-blue-500 font-semibold border-2 border-blue-500">
          Follow
        </a>
      </Link>
    </div>
  );
};

export default RecommendedUserListing

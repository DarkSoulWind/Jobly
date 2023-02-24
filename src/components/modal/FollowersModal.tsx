"THIS IS CLAPPED";

import React, { FC } from "react";
import Modal from "./Modal";
import { PRODUCTION_URL } from "@utils/url.mjs";
import { Follow } from "@prisma/client";

type FollowsProps = {
  modalOpen: boolean;
  toggle: () => void;
  followers: (Follow & {
    follower: {
      name: string;
      image: string | null;
    };
  })[];
};

type FollowingProps = {
  modalOpen: boolean;
  toggle: () => void;
  followers: (Follow & {
    following: {
      name: string;
      image: string | null;
    };
  })[];
};

type FollowersModalProps = FollowsProps | FollowingProps;

function isForFollowers(props: any): props is FollowsProps {
  if (props.followers) {
    if (props.followers.length == 0) return false;
    return props.followers[0].follower !== undefined;
  }
  return false;
}

const FollowersModal: FC<FollowersModalProps> = (props) => {
  console.log("file: FollowersModal.tsx~line: 36~FollowersModal~props", props);
  if (isForFollowers(props)) {
    const { followers, modalOpen, toggle } = props;

    return (
      <Modal
        open={modalOpen}
        confirmButton="Close"
        confirmButtonAction={toggle}
        title="Followers"
      >
        <div className="space-y-2">
          {followers.length === 0 && <p>No followers</p>}
          {followers?.map(({ follower, followerId }) => (
            <div key={followerId} className="flex items-center gap-2">
              <img
                src={follower.image ?? ""}
                alt={`${follower.name} pfp`}
                className="rounded-full h-12 w-12"
                onError={(e) => {
                  e.preventDefault();
                  console.log("ERROR LOADING IMAGE");
                  e.currentTarget.onerror = null;
                  e.currentTarget.classList.add("animate-pulse");
                  e.currentTarget.src =
                    "https://i.pinimg.com/736x/dd/f0/11/ddf0110aa19f445687b737679eec9cb2.jpg";
                }}
              />

              <div className="text-sm">
                <a
                  href={`${PRODUCTION_URL}/user/${follower.name}`}
                  className="font-bold hover:underline"
                >
                  {follower.name}
                </a>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    );
  }

  const { followers: following, modalOpen, toggle } = props;

  return (
    <Modal
      open={modalOpen}
      confirmButton="Close"
      confirmButtonAction={toggle}
      title="Following"
    >
      <div className="space-y-2">
        {following.length === 0 && <p>No followers</p>}
        {following?.map(({ following, followingId }) => (
          <div key={followingId} className="flex items-center gap-2">
            <img
              src={following.image ?? ""}
              alt={`${following.name} pfp`}
              className="rounded-full h-12 w-12"
              onError={(e) => {
                e.preventDefault();
                console.log("ERROR LOADING IMAGE");
                e.currentTarget.onerror = null;
                e.currentTarget.classList.add("animate-pulse");
                e.currentTarget.src =
                  "https://i.pinimg.com/736x/dd/f0/11/ddf0110aa19f445687b737679eec9cb2.jpg";
              }}
            />

            <div className="text-sm">
              <a
                href={`${PRODUCTION_URL}/user/${following.name}`}
                className="font-bold hover:underline"
              >
                {following.name}
              </a>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default FollowersModal;

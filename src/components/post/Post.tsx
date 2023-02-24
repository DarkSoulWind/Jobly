import React, { FC, RefObject, Dispatch, Fragment } from "react";
import { FaComment, FaEllipsisH, FaShare, FaThumbsUp } from "react-icons/fa";
import { Post, User, UserPreference, Comment } from "@prisma/client";
import Markdown from "src/components/markdown/Markdown";
import { useRouter } from "next/router";
import { useModal } from "src/lib/hooks/useModal";
import { useDate } from "src/lib/hooks/useDate";
import { Action as FeedAction } from "src/lib/reducers/feedReducer";
import { Dialog, Menu, Transition } from "@headlessui/react";
import { HiFlag, HiTrash } from "react-icons/hi";
import { trpc } from "@utils/trpc";
import toast from "react-hot-toast";

type UserWithPreferences = User & { preferences: UserPreference | null };

interface PostProps {
  postData: Post & {
    user: {
      image: string | null;
      name: string;
    };
    comments: Comment[];
    postLikes: {
      postID: string;
      userID: string;
    }[];
  };
  yourData?: UserWithPreferences;
  commentInputRef?: RefObject<HTMLInputElement>;
  // feed dispatch action
  dispatch?: Dispatch<FeedAction>;
  // if the post is being displayed on its own page and not the feed
  pageExpanded: boolean;
}

const Post: FC<PostProps> = ({
  postData,
  yourData,
  commentInputRef,
  dispatch,
  pageExpanded,
}) => {
  const queryClient = trpc.useContext();
  const router = useRouter();

  // WHEN THE POST WAS POSTED RELATIVE TO TODAY
  const relativeDatePosted = useDate(new Date(postData.datePosted));

  // CONFIRM DELETE MODAL
  const [confirmDeleteOpen, , toggleConfirmDelete] = useModal(false);

  const fetchedPostLikes = trpc.post.likes.getByID.useQuery(
    { postID: postData.id },
    {
      initialData: postData.postLikes,
      refetchOnWindowFocus: false,
    }
  );

  const postDeleteMutation = trpc.post.delete.useMutation({
    onSuccess: () => {
      toggleConfirmDelete();
      toast.success("Post deleted!");
      // if the post is being shown on its own page then redirect to the feed
      if (pageExpanded) router.push("/feed");

      // if the post was deleted from the feed, then remove it from being rendered
      // and display the success message
      if (!pageExpanded && dispatch) {
        queryClient.post.getRecommended.invalidate();
      }
    },
    onError: (error) => {
      console.error(error);
      toast.error("Error deleting post.");
    },
  });

  const postLikeMutation = trpc.post.likes.toggleLike.useMutation({
    onSuccess: () => {
      queryClient.post.likes.getByID.invalidate();
    },
  });

  const likePost = async () => {
    const userID = yourData!.id;
    const postID = postData?.id;
    const alreadyLiked =
      fetchedPostLikes.data.filter(
        (postLike) => postLike.userID == yourData!.id
      ).length > 0;

    postLikeMutation.mutate({
      userID,
      postID,
      alreadyLiked,
    });
  };

  const deletePost = async () => {
    const postID = postData?.id;
    console.log("Deleting post...");
    postDeleteMutation.mutate({ postID });
  };

  return (
    <div className="w-full bg-white shadow-sm shadow-slate-300 rounded-lg overflow-clip border-[1px] border-slate-300">
      <div className="px-4 py-1">
        <div className="relative flex justify-end items-center mb-1">
          <Menu>
            <Menu.Button className="relative group p-2 rounded-full aspect-square hover:bg-slate-100 transition-all">
              <FaEllipsisH />
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute top-5 mt-1 w-56 divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="p-1">
                  {postData.user.name === yourData?.name && (
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={toggleConfirmDelete}
                          className={`${
                            active
                              ? "bg-violet-500 text-white"
                              : "text-gray-900"
                          } group flex gap-2 w-full items-center transition-all duration-300 rounded-md px-2 py-2 text-sm`}
                        >
                          <HiTrash
                            className={`w-5 h-5 ${
                              active ? "fill-white" : "fill-red-500"
                            }`}
                          />
                          <p
                            className={`font-bold ${
                              active ? "text-white" : "text-red-500 "
                            }`}
                          >
                            Delete
                          </p>
                        </button>
                      )}
                    </Menu.Item>
                  )}

                  {postData?.user?.name !== yourData?.name && (
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={`${
                            active
                              ? "bg-violet-500 text-white"
                              : "text-gray-900"
                          } group flex gap-2 w-full items-center transition-all duration-300 rounded-md px-2 py-2 text-sm`}
                        >
                          <HiFlag className="w-5 h-5" />
                          <p className={`font-bold`}>Report</p>
                        </button>
                      )}
                    </Menu.Item>
                  )}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
        <hr />
        <div className="flex mt-3 justify-start items-center w-full gap-2">
          <div className="aspect-square rounded-full p-[0.15rem] bg-gradient-to-br from-blue-500 to-violet-500">
            {/* USER PFP */}
            <img
              loading="lazy"
              src={postData?.user?.image ?? ""}
              className="aspect-square border-2 bg-white border-white w-14 rounded-full"
              alt={`${postData?.user?.name} PFP`}
              onError={(e) => {
                e.preventDefault();
                console.log("ERROR LOADING IMAGE");
                e.currentTarget.onerror = null;
                e.currentTarget.classList.add("animate-pulse");
                e.currentTarget.src =
                  "https://i.pinimg.com/736x/dd/f0/11/ddf0110aa19f445687b737679eec9cb2.jpg";
              }}
            />
          </div>

          {/* USERNAME AND DATE POSTED */}
          <div className="w-full text-sm">
            <h4
              className="font-bold cursor-pointer hover:underline"
              onClick={() => router.push(`/user/${postData?.user?.name}`)}
            >
              {postData?.user?.name}
            </h4>
            <p>{relativeDatePosted}</p>
          </div>

          {yourData?.name != postData?.user?.name && pageExpanded && (
            <div className="px-3 py-1 cursor-pointer hover:bg-blue-100 rounded-lg transition-all">
              <button className="text-blue-500 font-semibold">
                +&nbsp;Follow
              </button>
            </div>
          )}
        </div>

        {/* POST TEXT */}
        <Markdown className="mt-2">{postData.postText}</Markdown>
      </div>

      {/* POST IMAGE */}
      <img
        src={postData?.image ?? ""}
        loading="lazy"
        className="w-full"
        alt=""
      />

      {/* LIKE AND COMMENT COUNT */}
      <div className="px-3">
        <div className="flex justify-between items-center text-xs py-1">
          <button className="hover:text-blue-500 hover:underline">
            <p>
              {fetchedPostLikes.data.length ?? "0"}{" "}
              {fetchedPostLikes.data.length === 1 ? "like" : "likes"}
            </p>
          </button>
          <button className="hover:text-blue-500 hover:underline">
            <p>
              {postData.comments?.length ?? "0"}{" "}
              {postData.comments?.length === 1 ? "comment" : "comments"}
            </p>
          </button>
        </div>
        <hr />
      </div>

      <div className="flex justify-around items-center py-1 px-3">
        {/* LIKE BUTTON */}
        <button
          onClick={likePost}
          disabled={postLikeMutation.isLoading}
          className="flex items-center hover:bg-slate-100 disabled:bg-slate-100 transition-all rounded-lg gap-1 py-2 px-8"
        >
          <FaThumbsUp
            className={`${
              fetchedPostLikes.data.filter(
                (postLike) => postLike.userID === yourData?.id
              ).length > 0
                ? "fill-blue-500"
                : "fill-slate-500"
            }`}
          />
          <p
            className={`font-semibold ${
              fetchedPostLikes.data.filter(
                (postLike) => postLike.userID === yourData?.id
              ).length > 0
                ? "text-blue-500"
                : "text-slate-500"
            }`}
          >
            {fetchedPostLikes.data.filter(
              (postLike) => postLike.userID === yourData?.id
            ).length > 0
              ? "Liked"
              : "Like"}
          </p>
        </button>

        {/* COMMENT BUTTON */}
        <button
          onClick={() => {
            if (!pageExpanded) {
              router.push(`/post/${postData?.id}`);
            } else {
              console.log("lol");
              commentInputRef?.current?.focus();
            }
          }}
          className="flex items-center hover:bg-slate-100 transition-all rounded-lg gap-1 py-2 px-8"
        >
          <FaComment className="fill-slate-500" />
          <p className="text-slate-500 font-semibold">Comment</p>
        </button>

        {/* SHARE BUTTON */}
        <button className="flex items-center hover:bg-slate-100 transition-all rounded-lg gap-1 py-2 px-8">
          <FaShare className="fill-slate-500" />

          <p className="text-slate-500 font-semibold">Share</p>
        </button>
      </div>

      {/* CONFIRM DELETE MODAL */}

      <Transition appear show={confirmDeleteOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={toggleConfirmDelete}
        >
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
                    Are you sure?
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      This will permanently delete your post forever.
                    </p>
                  </div>

                  <div className="mt-4 block space-x-2">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={toggleConfirmDelete}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                      onClick={deletePost}
                    >
                      Delete
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default Post;

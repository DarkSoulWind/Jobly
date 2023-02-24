import { z } from "zod";
import { procedure, router } from "../trpc";
import { prisma } from "@lib/prisma";

const fetchFollowsByUserID = procedure
  .input(
    z.object({
      userID: z.string(),
    })
  )
  .query(async ({ input: { userID } }) => {
    const follows = await prisma.user.findFirst({
      where: {
        id: userID,
      },
      select: {
        name: true,
        followers: {
          include: {
            follower: {
              select: {
                name: true,
                image: true,
                password: false,
              },
            },
          },
        },
        following: {
          include: {
            following: {
              select: {
                name: true,
                image: true,
                password: false,
              },
            },
          },
        },
      },
    });

    return follows;
  });

const addFollow = procedure
  .input(
    z.object({
      followerId: z.string(),
      followingId: z.string(),
      alreadyFollowed: z.boolean(),
    })
  )
  .mutation(async ({ input: { followerId, followingId, alreadyFollowed } }) => {
    // if follow exists then remove it
    if (alreadyFollowed) {
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          },
        },
      });
    }
    // else create the follow
    else {
      await prisma.follow.create({
        data: {
          followerId,
          followingId,
        },
      });
    }
  });

export default router({
  getByUserID: fetchFollowsByUserID,
  toggleFollow: addFollow,
});

import { z } from "zod";
import { procedure, router } from "../trpc";
import { prisma } from "@lib/prisma";

const allComments = procedure
  .input(
    z.object({
      postID: z.string({
        required_error: "PostID not provided for fetching comments.",
      }),
    })
  )
  .query(async ({ input: { postID } }) => {
    const commentData = await prisma.comment.findMany({
      where: {
        postID,
      },
      include: {
        user: {
          select: {
            password: false,
            image: true,
            name: true,
            email: true,
            preferences: true,
          },
        },
      },
      orderBy: {
        datePosted: "desc",
      },
    });

    return { commentData };
  });

const addComment = procedure
  .input(
    z.object({
      userID: z.string(),
      postID: z.string(),
      commentText: z
        .string()
        .min(6, { message: "Comment must be at least 6 characters long." }),
    })
  )
  .mutation(async ({ input: { userID, postID, commentText } }) => {
    const comment = await prisma.comment.create({
      data: {
        userID,
        postID,
        commentText,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
            email: true,
            preferences: true,
          },
        },
      },
    });

    return { comment };
  });

const deleteComment = procedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ input: { id } }) => {
    const response = await prisma.comment.delete({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
            email: true,
            preferences: true,
          },
        },
      },
    });

    return response;
  });

export default router({
  all: allComments,
  add: addComment,
  delete: deleteComment,
});

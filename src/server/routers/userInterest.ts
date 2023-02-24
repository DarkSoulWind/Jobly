import { z } from "zod";
import { procedure, router } from "../trpc";
import { prisma } from "@lib/prisma";

const getByUserId = procedure
  .input(
    z.object({
      userID: z.string(),
    })
  )
  .query(async ({ input: { userID } }) => {
    const userInterests = await prisma.userInterest.findMany({
      where: {
        userID,
      },
    });

    return userInterests;
  });

const addUserInterest = procedure
  .input(
    z.object({
      userID: z.string(),
      name: z.string(),
    })
  )
  .mutation(async ({ input: { userID, name } }) => {
    const userInterest = await prisma.userInterest.create({
      data: {
        userID,
        name,
      },
    });

    return userInterest;
  });

const deleteUserInterest = procedure
  .input(
    z.object({
      userID: z.string(),
      name: z.string(),
    })
  )
  .mutation(async ({ input: { userID, name } }) => {
    const userInterest = await prisma.userInterest.delete({
      where: {
        userID_name: {
          userID,
          name,
        },
      },
    });

    return userInterest;
  });

export default router({
  getByUserId,
  add: addUserInterest,
  delete: deleteUserInterest,
});

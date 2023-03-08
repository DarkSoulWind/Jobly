import { z } from "zod";
import { procedure, router } from "../trpc";
import { prisma } from "@lib/prisma";

const getChats = procedure
  .input(
    z.object({
      email: z.string(),
    })
  )
  .query(async ({ input: { email } }) => {
    const chats = await prisma.chat.findMany({
      where: {
        participants: {
          some: {
            user: {
              email,
            },
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
                online: true,
                password: false,
              },
            },
          },
        },
      },
    });

    return chats;
  });

export default router({
  get: getChats
})

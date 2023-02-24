import { z } from "zod";
import { procedure, router } from "../trpc";
import { prisma } from "@lib/prisma";

const filterByQuery = procedure
  .input(
    z.object({
      query: z.string(),
    })
  )
  .query(async ({ input: { query } }) => {
    if (query.trim() === "") {
      const interests = await prisma.interest.findMany({
        select: {
          name: true,
        },
      });
      return interests;
    }

    const interests = await prisma.interest.findMany({
      where: {
        name: {
          contains: query,
        },
      },
      select: {
        name: true,
      },
    });
    return interests;
  });

export default router({
  filter: filterByQuery,
});

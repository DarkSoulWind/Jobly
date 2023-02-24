import { z } from "zod";
import { procedure, router } from "../trpc";
import { prisma } from "@lib/prisma";
import { NotFoundError } from "@prisma/client/runtime";

const getUserByEmail = procedure
  .input(
    z.object({
      email: z.string().email(),
    })
  )
  .query(async ({ input: { email } }) => {
    const user = await prisma.user.findFirst({
      where: { email },
      select: {
        preferences: true,
        followers: true,
        following: true,
        id: true,
        password: false,
        phoneNumber: false,
        email: false,
        image: true,
        name: true,
      },
    });

    return user;
  });

const getProfile = procedure
  .input(
    z.object({
      email: z.string().email(),
    })
  )
  .query(async ({ input: { email } }) => {
    // get the users phone number
    const userData = await prisma.user.findFirst({
      where: { email },
      select: {
        phoneNumber: true,
        id: true,
      },
    });

    // get the users preferences
    const userPreferences = await prisma.userPreference.findFirst({
      where: {
        userID: userData!.id,
      },
    });

    return { ...userData, ...userPreferences };
  });

const updateProfile = procedure
  .input(
    z.object({
      email: z.string().email(),
      firstName: z.string(),
      lastName: z.string(),
      pronouns: z.string(),
      bio: z.string(),
      countryRegion: z.string(),
      postalCode: z.string(),
      city: z.string(),
      school: z.string(),
      phoneNumber: z.string(),
      phoneType: z.string(),
    })
  )
  .mutation(
    async ({
      input: {
        email,
        firstName,
        lastName,
        pronouns,
        bio,
        countryRegion,
        postalCode,
        city,
        school,
        phoneNumber,
        phoneType,
      },
    }) => {
      const updatedPreferences = {
        firstName,
        lastName,
        pronouns,
        bio,
        countryRegion,
        postalCode,
        city,
        school,
        phoneType,
      };

      const userID = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
        },
      });

      // update the user's phone number
      await prisma.user.update({
        where: {
          email,
        },
        data: {
          phoneNumber,
        },
      });

      // update the user's preferences
      try {
        await prisma.userPreference.update({
          where: {
            userID: userID!.id,
          },
          data: {
            ...updatedPreferences,
          },
        });
        // if the user does not have a user preferences record create a new one
      } catch (error) {
        await prisma.userPreference.create({
          data: {
            userID: userID!.id,
            ...updatedPreferences,
          },
        });
      }
    }
  );

export default router({
  getUserByEmail,
  profile: router({
    update: updateProfile,
    get: getProfile,
  }),
});

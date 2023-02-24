import { z } from "zod";
import { procedure, router } from "../trpc";
import { prisma } from "@lib/prisma";
import { dijkstra, Edge, GraphNode } from "@lib/graph";

const getRecommendedPeople = procedure
  .input(
    z.object({
      email: z.string().email(),
    })
  )
  .query(async ({ input: { email } }) => {
    const usersData = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        preferences: true,
        following: {
          select: {
            following: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        posts: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
                password: false,
              },
            },
            postLikes: {
              select: {
                userID: true,
                postID: true,
              },
            },
            comments: true,
          },
        },
        postLikes: {
          select: {
            post: {
              select: {
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        interests: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            following: true,
            postLikes: true,
          },
        },
      },
    });

    // TODO: remove people who you already follow from the recommended list
    const yourData = usersData.find((user) => user.email === email)!;
    const recommendationReasons = new Map<
      string,
      { name: string; reason: string }
    >();

    const userNodes = usersData.map(
      (user) => new GraphNode("user", { ...user })
    );

    const getUserNodeByID = (id: string) => {
      return userNodes.find((node) => node.get("id") === id);
    };

    const postLikeEdges = userNodes.flatMap((userNode) => {
      return userNode.get("postLikes").map(({ post: { user } }) => {
        // if the user liked their own post then skip
        if (userNode.get("name") === user.name) return [];

        recommendationReasons.set(userNode.get("id"), {
          name: userNode.get("name"),
          reason: "Based on posts you liked",
        });

        console.log(`Liked post by ${userNode.get("name")}`);
        return new Edge("liked post", { ...user })
          .link(userNode, getUserNodeByID(user.id)!)
          .setWeight(1);
      });
    });

    // console.log(
    //   "file: connect.ts~line: 90~getRecommendedPeople->query() callback->postLikeEdges~postLikeEdges",
    //   postLikeEdges
    // );

    // iterate over each user
    // iterate over the user's interests
    // iterate over other users that have your interest and create an edge between you and them
    const interestEdges = userNodes.flatMap((userNode1) => {
      return userNode1.get("interests").map((yourInterest) => {
        console.log(
          `${userNode1.get("name")} has an interest in ${yourInterest.name}`
        );
        const filteredUserNodes = userNodes.filter(
          (userNode2) =>
            userNode2
              .get("interests")
              .find(
                (theirInterest) => theirInterest.name === yourInterest.name
              ) && userNode2.get("name") !== userNode1.get("name")
        );
        // console.log(
        //   filteredUserNodes.map((filteredUser) => filteredUser.get("name"))
        // );

        return filteredUserNodes.map((userNode2) => {
          console.log(
            `${userNode1.get("name")} shares an interest with ${userNode2.get(
              "name"
            )}`
          );

          if (userNode1.get("id") === yourData.id) {
            recommendationReasons.set(userNode2.get("id"), {
              name: userNode2.get("name"),
              reason: "Based on your interests",
            });
          }

          return new Edge("interest", {
            id: userNode2.get("id"),
            interest: yourInterest,
          })
            .link(userNode1, userNode2)
            .setWeight(5);
        });
      });
    });

    const filteredByFollowsUserNodes = userNodes.filter(
      (userNode) =>
        !yourData.following.find(({ following: youAreFollowing }) => {
          if (userNode.get("email") === email) {
            return false;
          }
          if (youAreFollowing.id === userNode.get("id")) {
            console.log(`You are following ${userNode.get("name")}`);
          }
          return youAreFollowing.id === userNode.get("id");
        })
    );

    const startNode = filteredByFollowsUserNodes.find(
      (node) => node.get("email") === email
    )!;
    const distances = dijkstra(filteredByFollowsUserNodes, startNode);

    // representing the results from dijkstra's algorithm as a 2d array with the name of the user
    // and the distance from the start node to the user
    const distancesNamed = Object.entries(distances).map(([id, distance]) => {
      return [usersData.find((user) => user.id === id)!.name, distance];
    });
    console.log(
      "file: post.ts~line: 160~getRecommendedPosts->query() callback->distancesNamed~distancesNamed",
      distancesNamed
    );

    const recommendedUsers = Object.entries(distances).flatMap(
      ([id, distance]) => {
        // dont return the user data if there is no relationship (distance is Infinity)
        if (distance === Infinity) return [];

        // if the user is you dont return
        if (id === yourData.id) return [];

        const selectedUser = usersData.find((user) => user.id === id)!;
        const selectedStuff = {
          id: selectedUser.id,
          name: selectedUser.name,
          image: selectedUser.image,
          preferences: selectedUser.preferences,
          recommendationReason: recommendationReasons.get(selectedUser.id)
            ?.reason,
        };
        console.log(
          "file: connect.ts~line: 171~getRecommendedPeople->query() callback->recommendedUsers->flatMap() callback->selectedStuff->recommendationReason~recommendationReason",
          recommendationReasons
        );

        return selectedStuff;
      }
    );

    return recommendedUsers;
  });

export default router({
  getRecommended: getRecommendedPeople,
});

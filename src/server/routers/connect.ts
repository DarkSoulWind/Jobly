import { z } from "zod";
import { procedure, router } from "../trpc";
import { prisma } from "@lib/prisma";
import { dijkstra, Edge, GraphNode } from "@lib/graph";

interface RecommendationReasonsMap {
  [userID: string]: {
    reason: string;
    name: string;
    scores: {
      postLikes: number;
      interests: number;
    };
  };
}

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

    const yourData = usersData.find((user) => user.email === email)!;

    // STRUCTURE OF RECOMMENDATION REASONS
    // {
    //   "id": {
    //   "name": "Datmin",
    //   "reason": "Based on the highest score out of postLikes, follows and interests.",
    //   "scores":
    //   {
    //   "postLikes": 0,
    //   "interests": 69
    //   }
    //   }
    // }

    const recommendationReasons: RecommendationReasonsMap = {};
    for (const user of usersData) {
      recommendationReasons[user.id] = {
        reason: "",
        name: user.name,
        scores: {
          postLikes: 0,
          interests: 0,
        },
      };
    }

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

        recommendationReasons[userNode.get("id")].scores.postLikes += 1;
        if (
          Math.max(
            ...Object.values(recommendationReasons[userNode.get("id")].scores)
          ) === recommendationReasons[userNode.get("id")].scores.postLikes
        ) {
          recommendationReasons[userNode.get("id")].reason =
            "Based on posts you've liked";
        }

        console.log(`${yourData.name} liked post by ${userNode.get("name")}`);
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
            recommendationReasons[userNode2.get("id")].scores.interests += 1;
            if (
              Math.max(
                ...Object.values(
                  recommendationReasons[userNode2.get("id")].scores
                )
              ) === recommendationReasons[userNode2.get("id")].scores.interests
            ) {
              recommendationReasons[userNode2.get("id")].reason =
                "Based on your interests";
            }

            //   recommendationReasons.set(userNode2.get("id"), {
            //     name: userNode2.get("name"),
            //     reason: "Based on your interests",
            //   });
            // }
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

    // your node is the start node
    const startNode = userNodes.find((node) => node.get("email") === email)!;
    const distances = dijkstra(userNodes, startNode);

    // DEBUG PURPOSES ONLY
    // representing the results from dijkstra's algorithm as a 2d array with the name of the user
    // and the distance from the start node to the user
    const distancesNamed = Object.entries(distances).map(([id, distance]) => {
      return [
        { name: usersData.find((user) => user.id === id)!.name, id },
        distance,
      ];
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

        // if the user is in your following list
        if (
          yourData.following.filter(({ following }) => {
            return following.id === id;
          }).length > 0
        )
          return [];

        // find the user with the id
        const selectedUser = usersData.find((user) => user.id === id)!;
        const selectedStuff = {
          id: selectedUser.id,
          name: selectedUser.name,
          image: selectedUser.image,
          preferences: selectedUser.preferences,
          recommendationReason: recommendationReasons[selectedUser.id].reason,
        };

        return selectedStuff;
      }
    );

    console.log(
      "file: connect.ts~line: 171~getRecommendedPeople->query() callback->recommendedUsers->flatMap() callback->selectedStuff->recommendationReason~recommendationReason",
      recommendationReasons
    );

    return recommendedUsers;
  });

export default router({
  getRecommended: getRecommendedPeople,
});

import { z } from "zod";
import { procedure, router } from "../trpc";
import { prisma } from "@lib/prisma";
import { deleteObject, ref } from "firebase/storage";
import { storage } from "firebase-config";
import { dijkstra, Edge, GraphNode } from "@lib/graph";
import Filter from "bad-words";

const filter = new Filter({ placeHolder: "*" });

const getRecommendedPosts = procedure
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

    const userNodes = usersData.map(
      (user) => new GraphNode("user", { ...user })
    );

    const getUserNodeByID = (id: string) => {
      return userNodes.find((node) => node.get("id") === id);
    };

    const followEdges = userNodes.flatMap((userNode) => {
      return userNode.get("following").map(({ following }) => {
        return new Edge("following", { ...following })
          .link(userNode, getUserNodeByID(following.id)!)
          .setWeight(5);
      });
    });

    const postLikeEdges = userNodes.flatMap((userNode) => {
      return userNode.get("postLikes").map(({ post: { user } }) => {
        if (userNode.get("name") === user.name) return [];
        return new Edge("liked post", { ...user })
          .link(userNode, getUserNodeByID(user.id)!)
          .setWeight(1);
      });
    });

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
          return new Edge("interest", { id: userNode2.get("id"), interest: yourInterest })
            .link(userNode1, userNode2)
            .setWeight(5);
        });
      });
    });

    // interestEdges.forEach((edge) => console.log(edge.toString()));

    // const you = userNodes
    //   .find((node) => node.get("email") === email)!.edges.toString()
    // console.log(
    //   "file: post.ts~line: 138~getRecommendedPosts->query() callback->you~you",
    //   you
    // );

    const startNode = userNodes.find((node) => node.get("email") === email)!;
    const distances = dijkstra(userNodes, startNode);
    console.log(
      "file: post.ts~line: 153~getRecommendedPosts->query() callback->distances~distances",
      distances
    );

    // representing the results from dijkstra's algorithm as a 2d array with the name of the user
    // and the distance from the start node to the user
    const distancesNamed = Object.entries(distances).map(([id, distance]) => {
      return [usersData.find((user) => user.id === id)!.name, distance];
    });
    console.log(
      "file: post.ts~line: 160~getRecommendedPosts->query() callback->distancesNamed~distancesNamed",
      distancesNamed
    );

    const recommendedPosts = Object.entries(distances).flatMap(
      ([id, distance]) => {
        // dont return the user data if there is no relationship (distance is Infinity)
        if (distance === Infinity) return [];
        return usersData.find((user) => user.id === id)!.posts;
      }
    );
    recommendedPosts.sort((a, b) => {
      if (a.datePosted > b.datePosted) return -1;
      else if (a.datePosted < b.datePosted) return 1;
      else return 0;
    });

    return recommendedPosts;
  });

const addPost = procedure
  .input(
    z.object({
      userID: z.string(),
      postText: z
        .string({ required_error: "Post body is empty." })
        .min(10, { message: "Post body must be longer than 10 characters." })
        .max(128, { message: "Post body must be 128 characters or fewer." })
        .trim(),

      image: z.string().optional(),
      imageRef: z.string(),
    })
  )
  .mutation(async ({ input: { userID, postText, image, imageRef } }) => {
    const post = await prisma.post.create({
      data: {
        userID,
        postText: filter.clean(postText),
        image,
        imageRef,
      },
    });
    return { post };
  });

const deletePost = procedure
  .input(
    z.object({
      postID: z.string(),
    })
  )
  .mutation(async ({ input: { postID } }) => {
    const post = await prisma.post.delete({
      where: {
        id: postID,
      },
    });
    console.log("Deleted post", JSON.stringify(post, null, 4));

    // if the post has an image
    if (post.image != null) {
      const imageRef = ref(storage, post.imageRef!);
      await deleteObject(imageRef);
      console.log("Deleted image from firebase storage with TRPC!");
    }
  });

const fetchPostLikes = procedure
  .input(
    z.object({
      postID: z.string(),
    })
  )
  .query(async ({ input: { postID } }) => {
    const postLikes = await prisma.postLike.findMany({
      where: {
        postID,
      },
    });

    return postLikes;
  });

const likePost = procedure
  .input(
    z.object({
      userID: z.string(),
      postID: z.string(),
      alreadyLiked: z.boolean(),
    })
  )
  .mutation(async ({ input: { userID, postID, alreadyLiked } }) => {
    if (alreadyLiked) {
      // remove the like
      await prisma.postLike.delete({
        where: {
          userID_postID: {
            userID,
            postID,
          },
        },
      });
    } else {
      // create a like
      await prisma.postLike.create({
        data: {
          userID,
          postID,
        },
      });
    }
  });

export default router({
  add: addPost,
  delete: deletePost,
  getRecommended: getRecommendedPosts,
  likes: router({
    getByID: fetchPostLikes,
    toggleLike: likePost,
  }),
});

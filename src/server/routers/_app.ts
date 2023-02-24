import { router } from "../trpc";
import CommentRouter from "./comment";
import ConnectRouter from "./connect";
import FollowRouter from "./follow";
import InterestRouter from "./interest";
import JobRouter from "./job";
import PostRouter from "./post";
import UserRouter from "./user";
import UserInterestRouter from "./userInterest";

export const appRouter = router({
  comment: CommentRouter,
  connect: ConnectRouter,
  post: PostRouter,
  follow: FollowRouter,
  user: UserRouter,
  userInterest: UserInterestRouter,
  interest: InterestRouter,
  job: JobRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

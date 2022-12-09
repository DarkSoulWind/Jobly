import { PostLike } from "@prisma/client";
import { Dispatch, SetStateAction, useState, useEffect } from "react";

// CHECK IF THIS POST IS LIKED BY YOU OR NOT
const usePostLiked = (
	postLikes: PostLike[],
	userID: string
): [boolean, Dispatch<SetStateAction<boolean>>] => {
	const [postLiked, setPostLiked] = useState<boolean>(false);

	useEffect(() => {
		console.log("use effect post likes", postLikes);
		setPostLiked(
			postLikes?.filter((like) => like.userID === userID).length > 0
		);
		console.log("use effect post liked:", postLiked);
	}, [postLikes, userID]);

	return [postLiked, setPostLiked];
};

export default usePostLiked;

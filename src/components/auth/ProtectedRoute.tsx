import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { ReactNode, useEffect } from "react";

/**
 * If the user is not logged in, redirect them to the home page
 * @param  - children - the children of the component
 * @returns A React component that renders its children if the user is authenticated, otherwise it
 * redirects to the home page.
 */
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
	const { status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/");
		}
	}, [router, status]);

	if (status === "unauthenticated") return null;

	return <>{children}</>;
};

export default ProtectedRoute;

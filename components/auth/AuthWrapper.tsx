import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { ReactNode } from "react";
import ProtectedRoute from "@components/auth/ProtectedRoute";

// routes that can only be accessed if the user is logged in
const authRoutes = [
	"/feed",
	"/direct",
	"/user",
	"/search",
	"/post",
	"/connect",
	"/jobs/saved",
];

const AuthWrapper = ({ children }: { children: ReactNode }) => {
	const { status } = useSession();
	const router = useRouter();

	if (status === "loading") return null;

	return (
		<>
			{authRoutes.includes(router.pathname) ||
			authRoutes.filter((r) => router.pathname.startsWith(r)).length >
				0 ? (
				<ProtectedRoute>{children}</ProtectedRoute>
			) : (
				children
			)}
		</>
	);
};

export default AuthWrapper;

import React, { FC, useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { signIn } from "next-auth/react";
import { PRODUCTION_URL } from "@lib/url";

const SignInWithGoogleButton: FC = () => {
	const [loading, setLoading] = useState(false);

	const handleSignIn = async () => {
		setLoading(true);
		await signIn("google", {
			callbackUrl: `${PRODUCTION_URL}/feed`,
		});
		setLoading(false);
	};

	return (
		<button
			onClick={handleSignIn}
			disabled={loading}
			className="w-full mt-4 relative rounded-lg p-3 border-[1px] transition-all duration-500 disabled:bg-blue-100 hover:bg-blue-100 disabled:border-blue-600 hover:border-blue-600 flex items-center justify-center"
		>
			<FaGoogle className="absolute left-3" />
			<p>Continue with Google</p>
		</button>
	);
};

export default SignInWithGoogleButton;

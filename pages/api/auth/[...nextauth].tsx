import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../lib/prisma";

export default NextAuth({
	adapter: PrismaAdapter(prisma),
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		}),
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: {
					label: "Email",
					type: "email",
					placeholder: "samsoong@gmail.com",
				},
				password: { label: "Password", type: "password" },
			},
			authorize: async (credentials, req) => {
				const res = await fetch(
					"http://localhost:3000/api/user/signin",
					{
						method: "POST",
						body: JSON.stringify(credentials),
						headers: { "Content-Type": "application/json" },
					}
				);
				const user = await res.json();

				if (res.ok && user) return user;

				// login failed
				console.error("Login failed");
				return null;
			},
		}),
	],
	callbacks: {
		jwt: ({ token, user }) => {
			if (user) {
				token.id = user.id;
			}

			return token;
		},
		session: ({ session, token }) => {
			if (token) {
				session.id = token.id;
			}

			return session;
		},
	},
	secret: "test",
	pages: {
		signIn: "/auth/signin",
	},
	jwt: {
		secret: "test",
	},
});

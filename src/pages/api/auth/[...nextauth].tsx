import NextAuth, { NextAuthOptions, Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "src/lib/prisma";
import axios, { AxiosResponse } from "axios";
import { JWT } from "next-auth/jwt";
import { PRODUCTION_URL } from "@utils/url.mjs";

const options: NextAuthOptions = {
	adapter: PrismaAdapter(prisma),
	pages: {
		// signIn: `${PRODUCTION_URL}/auth/signin`,
		signIn: `/auth/signin`,
        newUser: `/auth`
	},
	session: {
		strategy: "jwt",
	},
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		}),
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: {
					label: "Email address",
					type: "email",
					placeholder: "samsoong@gmail.com",
				},
				password: { label: "Password", type: "password" },
			},
			authorize: async (credentials, req) => {
				type APIResponse = {
					image: string | null;
					name: string;
					email: string | null;
					password: string | null;
					id: string;
				};

				const res = await axios
					.post<any, AxiosResponse<APIResponse, Error>>(
						`${PRODUCTION_URL}/api/user/signin`,
						{
							...credentials,
						}
					)
					.then((response) => {
						const user = response.data;

						if (response.status === 200 && user) {
							console.log(
								"🚀 ~ file: [...nextauth].tsx:38 ~ authorize: ~ user",
								user
							);
							console.log("ok signing in then");
							return user;
						}
					})
					.catch((error) => {
						// login failed
						console.error("Login failed");
						return null;
					});

				return res as APIResponse | null;
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
		session: ({ session, token }: { session: Session; token: JWT }) => {
			if (token) {
				session.id = token.id;
			}
			return session;
		},
	},
	secret: "am gei",
};
export default NextAuth(options);

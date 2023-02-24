import "../styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { useState } from "react";
import { QueryClient, QueryClientProvider, Hydrate } from "react-query";
import AuthWrapper from "src/components/auth/AuthWrapper";
import { trpc } from "@utils/trpc";

function MyApp({ Component, pageProps }: AppProps) {
	const [queryClient] = useState(() => new QueryClient());

	return (
		<SessionProvider session={pageProps.session}>
			<AuthWrapper>
				<QueryClientProvider client={queryClient}>
					<Hydrate state={pageProps.dehydratedState}>
						<Component {...pageProps} />
					</Hydrate>
				</QueryClientProvider>
			</AuthWrapper>
		</SessionProvider>
	);
}

export default trpc.withTRPC(MyApp);

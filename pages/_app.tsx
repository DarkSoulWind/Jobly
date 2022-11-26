import "../styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "react-query";
import AuthWrapper from "@components/auth/AuthWrapper";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<SessionProvider session={pageProps.session}>
			<AuthWrapper>
				<QueryClientProvider client={queryClient}>
					<Component {...pageProps} />
				</QueryClientProvider>
			</AuthWrapper>
		</SessionProvider>
	);
}

export default MyApp;

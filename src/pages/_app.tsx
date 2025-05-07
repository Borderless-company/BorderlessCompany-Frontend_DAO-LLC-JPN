import "@/styles/globals.css";
import "@/styles/hero-anim.css";
import "@/styles/complete.css";

import type { AppProps } from "next/app";
import { HeroUIProvider } from "@heroui/react";

// import WagmiWrapper from "@/components/provider/WagmiWrapper";
import ThirdwebProviderWrapper from "@/components/provider/ThirdwebProviderWrapper";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Provider } from "jotai";
import { IBM_Plex_Sans_JP } from "next/font/google";
import { RootLayout } from "@/components/layout/RootLayout";
import { appWithTranslation } from "next-i18next";

export const ibmPlexSansJP = IBM_Plex_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const queryClient = new QueryClient();

function App({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProviderWrapper>
      <HeroUIProvider>
        <QueryClientProvider client={queryClient}>
          <Provider>
            <RootLayout>
              <Component {...pageProps} />
            </RootLayout>
          </Provider>
        </QueryClientProvider>
      </HeroUIProvider>
    </ThirdwebProviderWrapper>
  );
}

export default appWithTranslation(App);

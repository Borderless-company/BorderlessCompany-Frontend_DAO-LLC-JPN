import "@/styles/globals.css";
import "@/styles/hero-anim.css";
import "@/styles/complete.css";

import type { AppProps } from "next/app";
import { NextUIProvider } from "@nextui-org/react";

import WagmiWrapper from "@/components/provider/WagmiWrapper";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Provider } from "jotai";
import { Noto_Sans_JP } from "next/font/google";
import { RootLayout } from "@/components/layout/RootLayout";
import { appWithTranslation } from "next-i18next";
import { ThirdwebProvider } from "thirdweb/react";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
});

const queryClient = new QueryClient();

function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiWrapper>
      <ThirdwebProvider>
        <NextUIProvider>
          <QueryClientProvider client={queryClient}>
            <Provider>
              <RootLayout>
                <Component {...pageProps} />
              </RootLayout>
            </Provider>
          </QueryClientProvider>
        </NextUIProvider>
      </ThirdwebProvider>
    </WagmiWrapper>
  );
}

export default appWithTranslation(App);

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

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
});

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiWrapper>
      <NextUIProvider>
        <QueryClientProvider client={queryClient}>
          <Provider>
            <RootLayout>
              <Component {...pageProps} />
            </RootLayout>
          </Provider>
        </QueryClientProvider>
      </NextUIProvider>
    </WagmiWrapper>
  );
}

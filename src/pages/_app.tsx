import "@/styles/globals.css";
import "@/styles/hero-anim.css";
import type { AppProps } from "next/app";
import { NextUIProvider } from "@nextui-org/react";

import WagmiWrapper from "@/components/provider/WagmiWrapper";

import clsx from "clsx";
import { Noto_Sans_JP } from "next/font/google";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiWrapper>
      <NextUIProvider>
        <Component {...pageProps} />
      </NextUIProvider>
    </WagmiWrapper>
  );
}

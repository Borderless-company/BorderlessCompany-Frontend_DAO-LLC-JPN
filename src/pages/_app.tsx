import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { NextUIProvider } from "@nextui-org/react";

import WagmiWrapper from "@/components/provider/WagmiWrapper";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiWrapper>
      <NextUIProvider>
        <Component {...pageProps} />
      </NextUIProvider>
    </WagmiWrapper>
  );
}

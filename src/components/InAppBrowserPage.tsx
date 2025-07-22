import { FC, useState } from "react";
import { Button } from "@heroui/react";
import { PiCopy, PiArrowUpRight, PiDesktop } from "react-icons/pi";
import { useInAppBrowser } from "@/hooks/useInAppBrowser";
import Image from "next/image";

export const InAppBrowserPage: FC = () => {
  const [copied, setCopied] = useState(false);
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("リンクのコピーに失敗しました:", error);
    }
  };

  const handleOpenInChrome = () => {
    const currentUrl = window.location.href;
    try {
      // iOS Safariの場合
      if (
        navigator.userAgent.includes("iPhone") ||
        navigator.userAgent.includes("iPad")
      ) {
        window.open(currentUrl, "_blank");
      } else {
        // Androidやその他の場合
        const newWindow = window.open(currentUrl, "_blank");
        if (
          !newWindow ||
          newWindow.closed ||
          typeof newWindow.closed === "undefined"
        ) {
          window.location.href = currentUrl;
        }
      }
    } catch (error) {
      console.error("外部ブラウザで開く際にエラーが発生しました:", error);
      window.location.href = currentUrl;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* ロゴ */}
        <div className="mb-8">
          <Image
            src="/borderless_logotype.png"
            alt="Borderless"
            width={200}
            height={40}
            className="mx-auto"
          />
        </div>

        {/* メインコンテンツ */}
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Chromeでこのページを開く
          </h1>

          <p className="text-gray-600 leading-relaxed">
            このデバイスでBorderlessを使用するには、Chromeモバイルブラウザでこのページを参照してください。すでにお持ちの場合はこちらをクリックしてください。
          </p>

          {/* Chromeで開くボタン */}
          <Button
            size="lg"
            color="primary"
            className="w-full bg-blue-600 text-white font-semibold"
            startContent={<PiArrowUpRight size={20} />}
            onPress={handleOpenInChrome}
          >
            Chromeで開く
          </Button>

          {/* Chromeがインストールされていない場合の手順 */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              このデバイスにChromeがインストールされていませんか？
            </h2>

            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 mb-2">
                    ページのリンクをコピーします
                  </p>
                  <Button
                    size="sm"
                    variant="bordered"
                    startContent={<PiCopy size={16} />}
                    onPress={handleCopyLink}
                    className="text-blue-600 border-blue-600"
                  >
                    {copied ? "コピー完了！" : "リンクをコピーする"}
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div className="flex-1">
                  <p className="text-gray-700">
                    Chromeモバイルブラウザをインストールします
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div className="flex-1">
                  <p className="text-gray-700">
                    検索バーにリンクを貼り付けます
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ノートパソコンの案内 */}
          <div className="bg-yellow-50 rounded-xl p-6 space-y-3">
            <div className="flex items-center justify-center gap-2 text-yellow-800">
              <PiDesktop size={20} />
              <h3 className="text-lg font-semibold">
                ノートパソコンをお持ちですか？
              </h3>
            </div>
            <p className="text-yellow-700 text-sm">
              最適な環境で使用するには、このページをノートパソコンデスクトップパソコンで開いてください
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

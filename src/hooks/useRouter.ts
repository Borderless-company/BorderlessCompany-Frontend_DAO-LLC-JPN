import { useState, useEffect } from "react";
import { useRouter } from "next/router";

/**
 * 画面遷移中の状態を管理するカスタムフック
 * @returns {object} - isNavigating: 画面遷移中かどうかの真偽値
 */
export const useRouterLoading = () => {
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleStart = () => {
      setIsNavigating(true);
    };

    const handleComplete = () => {
      setIsNavigating(false);
    };

    const handleError = () => {
      setIsNavigating(false);
    };

    // ルーターイベントにリスナーを追加
    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleError);

    // クリーンアップ
    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleError);
    };
  }, [router]);

  return { isNavigating };
};

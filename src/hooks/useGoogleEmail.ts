import { useEffect, useState } from "react";
import { client } from "@/utils/client";
import { useActiveAccount, useProfiles } from "thirdweb/react";
import { getUserEmail } from "thirdweb/wallets/in-app";

export const useGoogleEmail = () => {
  const [email, setEmail] = useState<string | null>(null);
  const [picture, setPicture] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const account = useActiveAccount();
  const { data: profiles } = useProfiles({ client });

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!account) return;

      setIsLoading(true);
      setError(null);

      try {
        // メールアドレスを取得: getUserEmail関数を使用
        const emailFromUser = await getUserEmail({ client });
        if (emailFromUser) {
          setEmail(emailFromUser);
        }

        // プロファイル情報から取得
        if (profiles && profiles.length > 0) {
          console.log("profiles: ", profiles);

          // Googleプロファイルを探す
          const googleProfile = profiles.find(
            (profile) => profile.type === "google"
          );

          if (googleProfile) {
            // メールアドレスを取得（getUserEmailでの取得に失敗した場合のバックアップ）
            if (
              !email &&
              googleProfile.details &&
              "email" in googleProfile.details
            ) {
              setEmail(googleProfile.details.email as string);
            }

            // プロフィール画像を取得
            if ("picture" in googleProfile.details) {
              setPicture(googleProfile.details.picture as string);
            }
          }

          // もしGoogleプロファイルがなければ、他のプロファイルを確認
          if (
            !picture &&
            profiles[0] &&
            profiles[0].details &&
            "picture" in profiles[0].details
          ) {
            setPicture(profiles[0].details.picture as string);
          }
        }

        if (!email) {
          console.log("メールアドレスが見つかりませんでした");
        }

        if (!picture) {
          console.log("プロフィール画像が見つかりませんでした");
        }

        setIsLoading(false);
      } catch (error) {
        console.error("プロフィール情報取得エラー:", error);
        setError(error instanceof Error ? error : new Error(String(error)));
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [account, profiles, email]);

  return {
    email,
    picture,
    isLoading,
    error,
    profiles, // デバッグ用に返す
  };
};

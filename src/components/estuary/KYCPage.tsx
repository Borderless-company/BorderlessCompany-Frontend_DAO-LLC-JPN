import { FC, useEffect, useState } from "react";
import SumsubWebSdk from "@sumsub/websdk-react";
import { MessageHandler } from "@sumsub/websdk";
import { useEstuaryContext } from "./EstuaryContext";
import { v4 as uuidv4 } from "uuid";
import { EventPayload } from "@sumsub/websdk/types/types";
import { useActiveAccount } from "thirdweb/react";
import { useUser } from "@/hooks/useUser";

const KYCPage: FC = () => {
  const { page, setPage } = useEstuaryContext();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const account = useActiveAccount();
  const { updateUser, createUser, user } = useUser(account?.address);

  // ユーザーのKYCステータスが「done」の場合は次のページに自動的に進む
  useEffect(() => {
    if (user && user.kyc_status === "done") {
      console.log("KYC already completed, skipping to next page");
      setPage((page) => page + 1);
    }
  }, [user, setPage]);

  useEffect(() => {
    const getAccessToken = async () => {
      if (!account?.address) return;

      try {
        const accessToken = await fetch("/api/kyc/accessToken", {
          method: "POST",
          body: JSON.stringify({
            userId: account.address,
            levelName: "borderless-kyc-level",
          }),
        });
        const accessTokenJson = await accessToken.json();
        console.log("accessToken: ", accessTokenJson);
        setAccessToken(accessTokenJson.token);
      } catch (error) {
        console.error("Error: ", error);
      }
    };
    getAccessToken();
  }, [account?.address]);

  const expirationHandler = async () => {
    try {
      const accessToken = await fetch("/api/kyc/accessToken", {
        method: "POST",
        body: JSON.stringify({
          userId: account?.address,
          levelName: "borderless-kyc-level",
        }),
      });
      const response = await accessToken.json();
      return response;
    } catch (error) {
      console.error("Error in expiration handler:", error);
      throw error;
    }
  };

  const kycMessageHandler: MessageHandler = (type, payload) => {
    if (type === "idCheck.onApplicantSubmitted") {
      console.log("onApplicantSubmitted: ", payload);
      setPage((page) => page + 1);
    }
    if (type === "idCheck.onApplicantStatusChanged") {
      console.log("onApplicantStatusChanged: ", payload);
      const CastedPayload =
        payload as EventPayload<"idCheck.onApplicantStatusChanged">;
      if (CastedPayload.reviewStatus === "completed") {
        // KYCの審査が完了したらユーザーのKYCステータスを更新
        createUser({
          evm_address: account?.address,
          kyc_status: "done",
        })
          .then(() => console.log("KYC status updated to done"))
          .catch((err) => console.error("Failed to update KYC status:", err));

        setPage((page) => page + 1);
      }
    }
    if (type === "idCheck.onModuleResultPresented") {
      console.log("onModuleResultPresented: ", payload);
    }
    if (type === "idCheck.onActionSubmitted") {
      console.log("onActionSubmitted: ", payload);
    }
    if (type === "idCheck.onActionCompleted") {
      console.log("onActionCompleted: ", payload);
    }
  };

  // KYCが既に完了している場合はローディング表示だけして自動的に次のページに進む
  if (user && user.kyc_status === "done") {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-pulse h-6 w-24 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <>
      {accessToken ? (
        <SumsubWebSdk
          onMessage={kycMessageHandler}
          accessToken={accessToken}
          expirationHandler={expirationHandler}
          options={{
            adaptIframeHeight: true,
            addViewportTag: false,
          }}
          config={{
            lang: "ja",
            i18n: {
              ja: {
                document_photo: {
                  loader: {
                    initial: "読み込み中...",
                  },
                },
              },
            },
          }}
          onError={(error) => console.error("Sumsub SDK error:", error)}
        />
      ) : (
        <div className="flex justify-center items-center p-4">
          <div className="animate-pulse h-6 w-24 bg-gray-200 rounded"></div>
        </div>
      )}
    </>
  );
};

export default KYCPage;

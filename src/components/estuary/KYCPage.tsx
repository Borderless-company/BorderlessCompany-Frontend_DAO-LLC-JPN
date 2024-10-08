import { Button } from "@nextui-org/react";
import { FC, useEffect, useState } from "react";
import {
  PiArrowRight,
  PiArrowLeft,
  PiIdentificationCardFill,
} from "react-icons/pi";
import Image from "next/image";
import SumsubWebSdk from "@sumsub/websdk-react";
import { MessageHandler } from "@sumsub/websdk";
import { useEstuaryContext } from "./EstuaryContext";
import { v4 as uuidv4 } from "uuid";
import { EventPayload } from "@sumsub/websdk/types/types";
import { useActiveAccount } from "thirdweb/react";

const KYCPage: FC = () => {
  const { page, setPage } = useEstuaryContext();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const account = useActiveAccount();

  const onClickBack = () => {
    setPage((page) => page - 1);
  };

  useEffect(() => {
    const generateSDKLink = async () => {
      try {
        const res = await fetch("/api/kyc/generateSDKLink", {
          method: "POST",
          body: JSON.stringify({
            levelName: "borderless-kyc-level",
            userId: account?.address,
          }),
        });
        const sdkLink = await res.json();
        console.log("sdkLink", sdkLink);
      } catch (error) {
        console.error(error);
      }
    };
    generateSDKLink();
  }, []);

  useEffect(() => {
    const getAccessToken = async () => {
      try {
        const accessToken = await fetch("/api/kyc/accessToken", {
          method: "POST",
          body: JSON.stringify({
            userId: account?.address,
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
  }, []);

  const expirationHandler = async () => {
    const accessToken = await fetch("/api/kyc/accessToken", {
      method: "POST",
      body: JSON.stringify({
        userId: account?.address,
        levelName: "borderless-kyc-level",
      }),
    });
    return accessToken.json();
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

  return (
    <>
      {accessToken ? (
        <SumsubWebSdk
          onMessage={kycMessageHandler}
          accessToken={accessToken}
          expirationHandler={expirationHandler}
          options={{ adaptIframeHeight: true, addViewportTag: false }}
          config={{ lang: "ja" }}
        />
      ) : (
        <>
          {/* Header */}
          {/* <div className="flex flex-col gap-2 p-6 pb-0">
            <PiIdentificationCardFill size={48} className="text-purple-600" />
            <h1 className="text-[28px] leading-8 font-bold text-slate-800">
              本人確認をしてください
            </h1>
          </div> */}

          {/* Content */}
          {/* <div className="flex flex-col gap-4 flex-1 py-6 justify-center items-center">
            <Image
              src={"/QR_sample.png"}
              alt="QR code"
              width={216}
              height={216}
            />
            <div className="flex flex-col gap-2 items-center">
              <p className="text-slate-700 text-xl text-center font-semibold">
                QRコードを携帯端末から読み取って、
                <br /> 本人確認を行ってください
              </p>
              <Button
                className="text-sm w-fit"
                size="sm"
                variant="light"
                color="primary"
                // onClick={onClickKYC}
              >
                読み取れない方はこちら
              </Button>
            </div>
          </div> */}

          {/* Footer */}
          {/* <div className="flex flex-col gap-4 p-6 pt-0 pb-4">
            <div className="flex flex-col">
              <Button
                className="w-fit text-base font-semibold"
                startContent={<PiArrowLeft color="blue" />}
                onClick={onClickBack}
                variant="bordered"
                color="primary"
                size="lg"
              >
                戻る
              </Button>
            </div>
            <div className="w-full flex justify-end items-center gap-2 px-2">
              <div className="w-fit text-slate-600 text-xs leading-3 font-normal font-mono pt-[2px]">
                powered by
              </div>
              <Image
                src={"/borderless_logotype.png"}
                alt="borderless logo"
                width={87}
                height={14}
              />
            </div>
          </div> */}
        </>
      )}
    </>
  );
};

export default KYCPage;

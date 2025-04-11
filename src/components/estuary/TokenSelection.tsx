import { FC, useEffect, useState } from "react";
import { RadioGroup } from "@heroui/react";
import { cn } from "@heroui/react";
import Image from "next/image";
import { Button } from "@heroui/react";
import { PiArrowRight, PiSignIn } from "react-icons/pi";
import { TokenCard } from "./TokenCard";
import { useActiveAccount, useConnectModal } from "thirdweb/react";
import { client } from "@/utils/client";
import { useEstuaryContext } from "./EstuaryContext";
import { useToken, createProduct } from "@/hooks/useToken";
import { useEstuary } from "@/hooks/useEstuary";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

export const TokenSelection: FC = () => {
  const { t, i18n } = useTranslation("estuary");
  const account = useActiveAccount();
  const { connect } = useConnectModal();
  const { setPage, setPrice, setToken } = useEstuaryContext();
  const [selectedTokenId, setSelectedTokenId] = useState<string>();
  const { token, updateToken } = useToken(selectedTokenId);
  const router = useRouter();
  const { estId } = router.query;
  const { estuary } = useEstuary(estId as string);

  useEffect(() => {
    console.log("estID", estId);
    console.log("estuary: ", estuary);
  }, [estuary]);

  const onClickNext = async () => {
    const product = await createProduct(
      token?.name!,
      token?.image || undefined
    );
    const updatedToken = await updateToken({
      id: token?.id,
      product_id: product.id,
    });
    setPrice(updatedToken?.fixed_price || 0);
    setToken(updatedToken);
    setPage(1);
  };

  useEffect(() => {
    console.log("[DEBUG] selected token: ", token);
    setSelectedTokenId(selectedTokenId);
  }, [token, selectedTokenId]);

  const handleConnect = async () => {
    const wallet = await connect({ client });
    console.log("Connected wallet: ", wallet);
  };
  console.log("language: ", i18n.language);

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-1 md:gap-2 p-6 pb-0">
        <Image
          src={(estuary?.company?.icon as string) || "/estuary_logo_sample.png"}
          alt="DAO LLC Logo"
          width={48}
          height={48}
          style={{
            objectFit: "cover",
            width: "48px",
            height: "48px",
            flexShrink: 0,
            borderRadius: "4px",
          }}
        />
        <h1 className="text-xl md:text-[28px] leading-8 font-bold text-slate-800">
          {i18n.language === "ja"
            ? `${estuary?.company?.COMPANY_NAME?.["ja-jp"]} ${t("Invest")}`
            : `${t("Invest")} ${estuary?.company?.COMPANY_NAME?.["en-us"]}`}
        </h1>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 md:gap-4 flex-1 py-2 md:py-1">
        <p className="text-slate-800 text-base md:text-lg font-semibold pl-6">
          {estuary?.tokens[0].is_executable
            ? "業務執行社員権トークンを購入する"
            : "非業務執行社員権トークンを購入する"}
        </p>
        <RadioGroup
          value={selectedTokenId}
          onValueChange={setSelectedTokenId}
          orientation="horizontal"
          classNames={{
            wrapper: cn(
              "flex gap-3 px-6 pt-1 pb-6 overflow-x-scroll flex-nowrap justify-center"
            ),
          }}
        >
          {estuary?.tokens.map((token) => {
            return (
              <TokenCard
                key={token.id}
                name={token.name || ""}
                value={token.id}
                imageSrc={token.image || "/estuary_logo_sample.png"}
                minPrice={token.min_price || 0}
                maxPrice={token.max_price || undefined}
                fixedPrice={token.fixed_price || undefined}
              />
            );
          })}
        </RadioGroup>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-4 p-6 pt-0 pb-4">
        <div className="flex flex-col md:gap-2">
          <div className="flex justify-between items-center h-14 px-2">
            <p className="text-slate-600 font-semibold text-xl md:text-2xl">
              {t("Price")}
            </p>
            <p className="text-slate-700 font-semibold text-2xl md:text-3xl">
              ¥
              {estuary?.tokens
                .find((token) => token.id === selectedTokenId)
                ?.fixed_price?.toLocaleString()}
            </p>
          </div>
          {account?.address ? (
            <Button
              className="w-full bg-yellow-700 text-white text-base font-semibold"
              endContent={<PiArrowRight color="white" />}
              onClick={onClickNext}
              isDisabled={!token || !selectedTokenId}
              size="lg"
            >
              {t("Next")}
            </Button>
          ) : (
            <Button
              startContent={<PiSignIn color="white" />}
              className="w-full bg-purple-700 text-white text-base font-semibold"
              onClick={handleConnect}
              size="lg"
            >
              {t("Sign In")}
            </Button>
          )}
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
      </div>
    </>
  );
};

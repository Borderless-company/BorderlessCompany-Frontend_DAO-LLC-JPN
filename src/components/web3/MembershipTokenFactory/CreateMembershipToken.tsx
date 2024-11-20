import { FormEvent, useEffect, useState } from "react";
import {
  useWaitForTransactionReceipt,
  useWriteContract,
  BaseError,
  useChainId,
} from "wagmi";
import { TokenServiceAbi } from "@/utils/abi/TokenService.sol/TokenService";
import { Address } from "viem";
import { Button, Checkbox, Input } from "@nextui-org/react";
import { getBlockExplorerUrl } from "@/utils/contractAddress";
import { useRouter } from "next/router";
import ImageUploader from "@/components/ImageUploader";
import { useAtom } from "jotai";
import { selectedFileAtom } from "@/atoms";
import { useToken } from "@/hooks/useToken";
import { uploadFile } from "@/utils/supabase";
import { useForm } from "react-hook-form";
import useMembershipTokens from "@/components/hooks/useMembershipTokens";
import { useTranslation } from "next-i18next";

type FormData = {
  name_: string;
  symbol_: string;
  baseURI_: string;
  price_: string;
};

export function CreateMembershipToken({
  contractAddress,
}: {
  contractAddress: Address;
}) {
  const [isClient, setIsClient] = useState(false);
  const chainId = useChainId();
  const router = useRouter();
  const { createToken } = useToken();
  const { daoId } = router.query;
  const [imgUrl, setImgUrl] = useState<string | undefined>(undefined);
  const { t } = useTranslation("common");

  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const {
    data: receipt,
    isLoading: isLoading,
    isSuccess: isSuccess,
  } = useWaitForTransactionReceipt({
    hash,
  });
  const {
    data: membershipTokenContracts,
    error: membershipTokenError,
    isPending: isMembershipTokenPending,
    fetchLogs,
  } = useMembershipTokens({ daoContractAddress: daoId as Address });

  const [blockExplorerUrl, setBlockExplorerUrl] = useState<string>();

  const {
    register,
    formState: { errors },
    getValues,
    handleSubmit,
  } = useForm<FormData>();
  const [selectedFile, setSelectedFile] = useAtom(selectedFileAtom);
  const [isSbt, setIsSbt] = useState(false);

  useEffect(() => {
    console.log("daoId: ", daoId);
  }, [daoId]);

  async function submit(e: FormData) {
    if (!contractAddress) {
      return;
    }

    if (selectedFile) {
      const { publicUrl } = await uploadFile(
        "token-image",
        `${contractAddress}-${e.symbol_}`,
        selectedFile
      );
      setImgUrl(publicUrl);
    }

    console.log(e);

    writeContract({
      address: contractAddress,
      abi: TokenServiceAbi,
      functionName: "activateStandard721Token",
      args: [e.name_, e.symbol_, e.baseURI_, isSbt],
    });
  }

  useEffect(() => {
    setBlockExplorerUrl(getBlockExplorerUrl(chainId));
  }, [chainId]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const _createToken = async () => {
      console.log("membershipTokenContracts: ", membershipTokenContracts);
      // console.log(
      //   "membershipTokenContracts: ",
      //   membershipTokenContracts[membershipTokenContracts.length - 1]
      //     .tokenAddress
      // );
      const createdToken = await fetchLogs();

      await createToken({
        name: getValues("name_"),
        symbol: getValues("symbol_"),
        is_executable: isSbt,
        fixed_price: parseInt(getValues("price_")),
        dao_id: daoId as string,
        image: imgUrl || undefined,
        contract_address: createdToken?.[createdToken.length - 1].tokenAddress,
      });
      setSelectedFile(undefined);
      router.reload();
    };

    if (isSuccess) {
      _createToken();
    }
  }, [isSuccess, receipt?.contractAddress, router]);

  return (
    <>
      {isClient && (
        <div>
          <form
            onSubmit={handleSubmit((e) => submit(e))}
            className="flex flex-col gap-3"
          >
            <ImageUploader label={t("Token Image")} />
            <div>
              <label className="font-semibold text-md">{t("Token Name")}</label>
              <Input
                key="inside"
                type="text"
                label=""
                labelPlacement="inside"
                placeholder={t("Enter Token Name")}
                description={t("e.g. Bitcoin, Ethereum")}
                variant="bordered"
                size="md"
                isRequired
                {...register("name_", { required: true })}
              />
            </div>
            <div>
              <label className="font-semibold text-md">
                {t("Token Symbol")}
              </label>
              <Input
                key="inside"
                type="text"
                label=""
                labelPlacement="inside"
                placeholder={t("Enter Token Symbol")}
                description={t("e.g. BTC, ETH, BNB")}
                variant="bordered"
                size="md"
                isRequired
                {...register("symbol_", { required: true })}
              />
            </div>
            <div>
              <label className="font-semibold text-md">{t("Price")}</label>
              <Input
                key="inside"
                type="number"
                label=""
                labelPlacement="inside"
                placeholder="0"
                description={t("Unit: JPY")}
                variant="bordered"
                size="md"
                isRequired
                {...register("price_", { required: true })}
              />
            </div>
            {/* <div>
              <label className="font-semibold text-md">
                トークン情報の参照URL
              </label>
              <Input
                key="inside"
                type="text"
                label=""
                labelPlacement="inside"
                placeholder="https://example.com/token-info.json"
                description="※ 現在は利用していません。"
                variant="bordered"
                size="md"
                {...register("baseURI_", { required: false })}
              />
            </div> */}
            <div>
              <Checkbox
                isSelected={isSbt}
                onValueChange={setIsSbt}
                size="md"
                classNames={{
                  label: "font-semibold",
                }}
              >
                {t("Make it executive")}
              </Checkbox>
            </div>

            <div className="mt-2">
              <Button type="submit" color="primary" size="md">
                {isPending ? t("Confirming...") : t("Create Token")}
              </Button>
            </div>
          </form>
          {hash && (
            <a
              className="text-blue-500"
              href={blockExplorerUrl + "/tx/" + hash}
              target="_blank"
              rel="noopener noreferrer"
            >
              Transaction Hash: {hash}
            </a>
          )}
          {isLoading && <div>Waiting for confirmation...</div>}
          {isSuccess && <div>Transaction confirmed.</div>}
          {error && (
            <div className="text-red-500">
              {error.message}
              {(error as BaseError).shortMessage || error.message}
            </div>
          )}
        </div>
      )}
    </>
  );
}

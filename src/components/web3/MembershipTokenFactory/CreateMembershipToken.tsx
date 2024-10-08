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

  const { data: hash, error, isPending, writeContract } = useWriteContract();

  const [blockExplorerUrl, setBlockExplorerUrl] = useState<string>();

  const [selectedFile, setSelectedFile] = useAtom(selectedFileAtom);
  const [isSbt, setIsSbt] = useState(false);

  useEffect(() => {
    console.log("daoId: ", daoId);
  }, [daoId]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    if (!contractAddress) {
      return;
    }
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name_ = formData.get("name_") as string;
    const symbol_ = formData.get("symbol_") as string;
    const baseURI_ = formData.get("baseURI_") as string;
    const price_ = formData.get("price_") as string;
    const sbt_ = isSbt;

    let imageUrl: string | undefined = undefined;
    if (selectedFile) {
      const { publicUrl } = await uploadFile(
        "token-image",
        `${contractAddress}-${symbol_}`,
        selectedFile
      );
      imageUrl = publicUrl;
    }

    await createToken({
      name: name_,
      symbol: symbol_,
      is_executable: sbt_,
      fixed_price: parseInt(price_),
      dao_id: daoId as string,
      image: imageUrl || undefined,
    });

    writeContract({
      address: contractAddress,
      abi: TokenServiceAbi,
      functionName: "activateStandard721Token",
      args: [name_, symbol_, baseURI_, sbt_],
    });
  }

  const { isLoading: isLoading, isSuccess: isSuccess } =
    useWaitForTransactionReceipt({
      hash,
    });

  useEffect(() => {
    setBlockExplorerUrl(getBlockExplorerUrl(chainId));
  }, [chainId]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isSuccess) {
      router.reload();
    }
  }, [isSuccess, router]);

  return (
    <>
      {isClient && (
        <div>
          <form onSubmit={submit} className="flex flex-col gap-3">
            <ImageUploader label="トークンの画像" />
            <div>
              <label className="font-semibold text-md">トークンの名前</label>
              <Input
                name="name_"
                key="inside"
                type="text"
                label=""
                labelPlacement="inside"
                placeholder="トークンの名前を入力"
                description="例) ビットコイン, Ethereum ※トークンのシンボルではありません。"
                variant="bordered"
                size="md"
              />
            </div>
            <div>
              <label className="font-semibold text-md">
                トークンのシンボル
              </label>
              <Input
                name="symbol_"
                key="inside"
                type="text"
                label=""
                labelPlacement="inside"
                placeholder="トークンのシンボルを入力"
                description="例) BTC,ETH,BNB"
                variant="bordered"
                size="md"
              />
            </div>
            <div>
              <label className="font-semibold text-md">トークンの価格</label>
              <Input
                name="price_"
                key="inside"
                type="number"
                label=""
                labelPlacement="inside"
                placeholder="0"
                description="単位:円"
                variant="bordered"
                size="md"
              />
            </div>
            <div>
              <label className="font-semibold text-md">
                トークン情報の参照URL
              </label>
              <Input
                name="baseURI_"
                key="inside"
                type="text"
                label=""
                labelPlacement="inside"
                placeholder="https://example.com/token-info.json"
                description="※ 現在は利用していません。"
                variant="bordered"
                size="md"
              />
            </div>
            <div>
              <Checkbox
                isSelected={isSbt}
                onValueChange={setIsSbt}
                size="md"
                classNames={{
                  label: "font-semibold",
                }}
              >
                業務執行社員トークンにする
              </Checkbox>
            </div>

            <div className="mt-2">
              <Button type="submit" color="primary" size="md">
                {isPending ? "Confirming..." : "トークンを作成する"}
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

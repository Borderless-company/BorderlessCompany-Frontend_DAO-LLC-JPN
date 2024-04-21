import { FormEvent, useEffect, useState } from "react";
import {
  useWaitForTransactionReceipt,
  useWriteContract,
  BaseError,
  useChainId,
} from "wagmi";
import { RegisterBorderlessCompanyAbi } from "@/utils/abi/RegisterBorderlessCompany.sol/RegisterBorderlessCompany";
import { Address, stringToHex } from "viem";
import { Button, Checkbox, DatePicker, Input } from "@nextui-org/react";
import {
  getBlockExplorerUrl,
  getRegisterBorderlessCompanyContractAddress,
} from "@/utils/contractAddress";

export function CreateBorderlessCompany() {
  const [isClient, setIsClient] = useState(false);
  const chainId = useChainId();

  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const [isConfirmed, setIsConfirmed] = useState(false);

  const [contractAddress, setContractAddress] = useState<Address>();
  const [blockExplorerUrl, setBlockExplorerUrl] = useState<string>();

  async function submit(e: FormEvent<HTMLFormElement>) {
    if (!contractAddress) {
      return;
    }
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const companyID_ = formData.get("companyID_") as string;

    if (!companyID_) {
      alert("会社IDが未入力です");
      return;
    }

    const establishmentDateValue = formData.get("establishmentDate_") as string;
    if (establishmentDateValue === "") {
      alert("設立日が未入力です。");
      return;
    }
    const establishmentDate_ = new Date(establishmentDateValue)
      .toISOString()
      .replace("T", " ")
      .substring(0, 19);
    const confirmedBool = isConfirmed;

    writeContract({
      address: contractAddress,
      abi: RegisterBorderlessCompanyAbi,
      functionName: "createBorderlessCompany",
      args: [
        stringToHex(companyID_),
        stringToHex(establishmentDate_),
        confirmedBool,
      ],
    });
  }

  const {
    data,
    isLoading: isLoading,
    isSuccess: isSuccess,
  } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    setContractAddress(getRegisterBorderlessCompanyContractAddress(chainId));
    setBlockExplorerUrl(getBlockExplorerUrl(chainId));
  }, [chainId]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isSuccess) return;
    console.log("isSuccess", data);
  }, [data, isSuccess]);
  // "0x7ed736cac3c10a50c2df691e2d9f2fbe92335afff45f517bd739ecbb0acd695d";

  return (
    <>
      {isClient && (
        <div className="max-w-xl mx-auto">
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-2">DAOの起動</h2>
            <p className="text-sm text-gray-600">
              ホワイトリストに登録されたユーザーのみこのフォームからDAOを起動できます。
            </p>
          </div>
          <form onSubmit={submit} className="flex flex-col gap-6">
            <div>
              <label className="font-semibold text-lg">会社ID</label>
              <Input
                name="companyID_"
                key="inside"
                type="text"
                label=""
                labelPlacement="inside"
                placeholder="会社IDを入力"
                description="DAOの設立時に利用するIDです。任意の文字列を選択できます。"
                variant="bordered"
                size="lg"
              />
            </div>
            <div>
              <label className="font-semibold text-lg">DAO設立日</label>
              <DatePicker
                name="establishmentDate_"
                label=""
                className="max-w-[284px]"
                description="DAOの設立日です。"
                labelPlacement="inside"
                variant="bordered"
                size="lg"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold text-lg">利用規約</label>
              <div className="overflow-y-scroll h-40 border-2 p-2 rounded-md">
                <p>
                  ※ 利用規約ダミー利用規約ダミー利用規約ダミー利用規約ダミー
                  利用規約ダミー 利用規約ダミー 利用規約ダミー 利用規約ダミー
                  利用規約ダミー 利用規約ダミー 利用規約ダミー
                  利用規約ダミー利用規約ダミー利用規約ダミー 利用規約ダミー
                  利用規約ダミー 利用規約ダミー 利用規約ダミー 利用規約ダミー
                  利用規約ダミー 利用規約ダミー 利用規約ダミー 利用規約ダミー
                  利用規約ダミー 利用規約ダミー 利用規約ダミー 利用規約ダミー
                  利用規約ダミー 利用規約ダミー 利用規約ダミー 利用規約ダミー
                  利用規約ダミー 利用規約ダミー 利用規約ダミー 利用規約ダミー
                  利用規約ダミー 利用規約ダミー 利用規約ダミー 利用規約ダミー
                  利用規約ダミー 利用規約ダミー 利用規約ダミー 利用規約ダミー
                  利用規約ダミー 利用規約ダミー 利用規約ダミー 利用規約ダミー
                  利用規約ダミー 利用規約ダミー 利用規約ダミー 利用規約ダミー
                  利用規約ダミー 利用規約ダミー 利用規約ダミー 利用規約ダミー
                  利用規約ダミー 利用規約ダミー 利用規約ダミー 利用規約ダミー
                  利用規約ダミー 利用規約ダミー 利用規約ダミー 利用規約ダミー
                  利用規約ダミー 利用規約ダミー 利用規約ダミー 利用規約ダミー
                  利用規約ダミー 利用規約ダミー 利用規約ダミー 利用規約ダミー
                  利用規約ダミー
                </p>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <Checkbox
                  isSelected={isConfirmed}
                  onValueChange={setIsConfirmed}
                >
                  利用規約に同意する
                </Checkbox>
              </div>
            </div>
            <div className="max-w-[284px] w-full mx-auto mt-6">
              <Button
                isDisabled={isConfirmed !== true}
                type="submit"
                color="primary"
                size="lg"
                className="font-semibold w-full bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-lg"
              >
                {isPending ? "Confirming..." : "DAOを起動"}
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
              {(error as BaseError).shortMessage || error.message}
            </div>
          )}
        </div>
      )}
    </>
  );
}

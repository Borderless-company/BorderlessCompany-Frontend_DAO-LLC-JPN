import { FC, useState, useEffect } from "react";
import { Button } from "@nextui-org/react";
import { useActiveAccount } from "thirdweb/react";
import { useRouter } from "next/router";
import { useEstuary } from "@/hooks/useEstuary";
import { useMember } from "@/hooks/useMember";
import Image from "next/image";
import { useSendTransaction } from "thirdweb/react";
import { Address, getContract, prepareContractCall } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { client } from "@/utils/client";

const ClaimPage: FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { estId } = router.query;
  const { estuary } = useEstuary(estId as string);
  const account = useActiveAccount();

  const { member } = useMember({
    userId: account?.address,
    daoId: estuary?.dao_id as string,
  });
  
  const contract = getContract({
    address: member?.token.contract_address as string,
    chain: sepolia,
    client: client,
  });

  const {
    mutate: sendTx,
    data: transactionResult,
    error: sendTxError,
  } = useSendTransaction();

  useEffect(() => {
    console.log("transactionResult: ", transactionResult);
    console.log("sendTxError: ", sendTxError);
  }, [transactionResult, sendTxError]);

  const handleClaim = async () => {
    setIsLoading(true);
    try {
      console.log("contract: ", contract);
      const transaction = prepareContractCall({
        contract: contract,
        method: "function mint(address to_)",
        params: [account?.address as string],
      });
      console.log("transaction: ", transaction);
      sendTx(transaction);
    } catch (error) {
      console.error("クレーム中にエラーが発生しました:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Content */}
      <div className="flex flex-col gap-4 flex-1 py-6 justify-center items-center">
        <Image
          src={member?.token.image || "/estuary_logo_sample.png"}
          alt="check"
          width={112}
          height={112}
          className="rounded-2xl object-cover w-56 h-56"
        />
        <div className="flex flex-col gap-1 items-center">
          <div className="flex gap-1 items-center">
            <p className=" text-stone-800 text-2xl text-center font-semibold">
              {member?.token.name}
            </p>
          </div>
          <p className="text-slate-500 text-base text-center font-medium">
            受け取るをタップして社員権を受け取ってください
          </p>
          <p>{"aaa" || transactionResult?.transactionHash}</p>
        </div>
        {/* <div className="flex gap-2">
          <Image src={"/etherscan.png"} alt="org logo" width={32} height={32} />
          <Image src={"/opensea.png"} alt="org logo" width={32} height={32} />
        </div> */}
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-4 p-6 pt-0 pb-4">
        <div className="flex flex-col">
          <Button
            className="w-full bg-yellow-700 text-white text-base font-semibold"
            onPress={handleClaim}
            size="lg"
            // isDisabled
          >
            受け取る
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
      </div>
    </>
  );
};

export default ClaimPage;

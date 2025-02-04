import { client } from "@/utils/client";
import { getContract, prepareContractCall } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { useSendTransaction } from "thirdweb/react";
export const contract = (smartAccount: string) => {
  return getContract({
    client,
    chain: defineChain(Number(process.env.NEXT_PUBLIC_CHAIN_ID)),
    address: smartAccount,
  });
};

export const useSetContractURI = () => {
  const { mutate: sendTransaction } = useSendTransaction();
  const sendTx = async (smartAccount: string) => {
    const account = contract(smartAccount);

    if (!account) return;

    const transaction = prepareContractCall({
      contract: account,
      method: "function setContractURI(string _uri)",
      params: [account.address],
    });
    sendTransaction(transaction);
  };

  return { sendTx };
};

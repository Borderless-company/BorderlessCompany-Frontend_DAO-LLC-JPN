import { FormEvent, useEffect, useState } from "react";
import {
  useWaitForTransactionReceipt,
  useWriteContract,
  BaseError,
  useChainId,
} from "wagmi";
import { RegisterBorderlessCompanyAbi } from "@/utils/abi/RegisterBorderlessCompany.sol/RegisterBorderlessCompany";
import { Address, stringToHex } from "viem";
import { Button, Checkbox, Input } from "@nextui-org/react";
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
    // example
    // companyID = "0x-borderless-company-id";
    // establishmentDate = "YYYY-MM-DD HH:MM:SS";
    // confirmed = true;
    const formData = new FormData(e.target as HTMLFormElement);
    const companyID_ = formData.get("companyID_") as string;
    const establishmentDate_ = new Date()
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

  const { isLoading: isLoading, isSuccess: isSuccess } =
    useWaitForTransactionReceipt({
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
    if (!hash) return;
    console.log("hash", hash);
  }, [hash]);

  return (
    <>
      {isClient && (
        <div>
          <form onSubmit={submit}>
            <Input name="companyID_" label="companyID_" required />

            <div className="flex flex-col gap-2">
              <Checkbox isSelected={isConfirmed} onValueChange={setIsConfirmed}>
                利用規約に同意する
              </Checkbox>
            </div>
            <Button
              isDisabled={isConfirmed !== true}
              type="submit"
              color="primary"
            >
              {isPending ? "Confirming..." : "DAOを起動"}
            </Button>
          </form>
          {hash && (
            <a
              className="text-blue-500"
              href={blockExplorerUrl + hash}
              target="_blank"
              rel="noopener noreferrer"
            >
              Transaction Hash: {hash}
            </a>
          )}
          {isLoading && "Waiting for confirmation..."}
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

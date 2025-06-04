import { useQuery } from "@tanstack/react-query";
import { client } from "@/utils/client";
import {
  Address,
  getContract,
  prepareContractCall,
  readContract,
} from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { useSendTransaction } from "thirdweb/react";
import { SCR_PROXY_ADDRESS } from "@/constants";
import SCR_ABI from "@/utils/abi/SCR_V2.json";
import SERVICE_FACTORY_ABI from "@/utils/abi/ServiceFactory.json";
import VOTE_ABI from "@/utils/abi/Vote.json";
import EXE_TOKEN_ABI from "@/utils/abi/LETS_JP_LLC_EXE_V2.json";
import NON_EXE_TOKEN_ABI from "@/utils/abi/LETS_JP_LLC_NON_EXE.json";
import SALE_ABI from "@/utils/abi/LETS_JP_LLC_SALE.json";
import { AbiCoder, ethers } from "ethers";

// contract

export const smartAccountContract = (smartAccount: string) => {
  return getContract({
    client,
    chain: defineChain(Number(process.env.NEXT_PUBLIC_CHAIN_ID)),
    address: smartAccount,
  });
};

export const scrProxyContract = () => {
  return getContract({
    client,
    chain: defineChain(Number(process.env.NEXT_PUBLIC_CHAIN_ID)),
    address: SCR_PROXY_ADDRESS,
  });
};

export const voteContract = (voteContractAddress: string) => {
  return getContract({
    client,
    chain: defineChain(Number(process.env.NEXT_PUBLIC_CHAIN_ID)),
    address: voteContractAddress,
    abi: JSON.parse(JSON.stringify(VOTE_ABI.abi)),
  });
};

export const exeTokenContract = (address: string) => {
  return getContract({
    client,
    chain: defineChain(Number(process.env.NEXT_PUBLIC_CHAIN_ID)),
    address: address,
    abi: JSON.parse(JSON.stringify(EXE_TOKEN_ABI.abi)),
  });
};

export const nonExeTokenContract = (address: string) => {
  return getContract({
    client,
    chain: defineChain(Number(process.env.NEXT_PUBLIC_CHAIN_ID)),
    address: address,
    abi: JSON.parse(JSON.stringify(NON_EXE_TOKEN_ABI.abi)),
  });
};

export const accountFactoryContract = (address: string) => {
  return getContract({
    client,
    chain: defineChain(Number(process.env.NEXT_PUBLIC_CHAIN_ID)),
    address: address,
  });
};

// write

export const useSetContractURI = () => {
  const { mutateAsync: sendTransaction } = useSendTransaction();
  const sendTx = async (smartAccount: string) => {
    const account = smartAccountContract(smartAccount);

    if (!account) return;

    const transaction = prepareContractCall({
      contract: account,
      method: "function setContractURI(string _uri)",
      params: [account.address],
    }) as any;
    const result = await sendTransaction(transaction);
    return result.transactionHash;
  };

  return { sendTx };
};

export const useCreateSmartCompany = () => {
  const { mutateAsync: sendTransaction } = useSendTransaction();
  const sendTx = async (props: {
    scId: string;
    beacon: string;
    legalEntityCode: string;
    companyName: string;
    establishmentDate: string;
    jurisdiction: string;
    entityType: string;
    scDeployParam: `0x${string}`;
    companyInfo: string[];
    scsBeaconProxy: string[];
    scsDeployParams: `0x${string}`[];
  }) => {
    const contract = scrProxyContract();
    const transaction = prepareContractCall({
      contract: contract,
      method: SCR_ABI.abi.find(
        (item) => item.name === "createSmartCompany"
      ) as any,
      params: [
        props.scId,
        props.beacon as Address,
        props.legalEntityCode,
        props.companyName,
        props.establishmentDate,
        props.jurisdiction,
        props.entityType,
        props.scDeployParam,
        props.companyInfo,
        props.scsBeaconProxy as readonly Address[],
        props.scsDeployParams,
      ],
    });
    console.log("transaction", transaction);
    // トランザクションハッシュを返す
    const result = await sendTransaction(transaction);
    console.log("result", result);
    return result.transactionHash;
  };

  return { sendTx };
};

// TODO: 型直す
export const useSetSaleInfo = () => {
  const { mutate: sendTransaction } = useSendTransaction();

  const sendTx = async ({
    type,
    founderAddress,
    saleInfo,
  }: {
    type: "exe" | "nonExe";
    founderAddress: string;
    saleInfo: {
      saleStart: number;
      saleEnd: number;
      fixedPrice: number;
      minPrice: number;
      maxPrice: number;
    };
  }) => {
    const tokenAddress = await readContract({
      contract: scrProxyContract(),
      method: SCR_ABI.abi.find(
        (item) => item.name === "getFounderService"
      ) as any,
      params: [founderAddress, type === "exe" ? 3 : 4],
    });
    if (!tokenAddress) throw new Error("Token address not found");
    const contract =
      type === "exe"
        ? exeTokenContract(tokenAddress as string)
        : nonExeTokenContract(tokenAddress as string);
    const transaction = prepareContractCall({
      contract: contract,
      method: SALE_ABI.abi.find((item) => item.name === "setSaleInfo") as any,
      params: [
        saleInfo.saleStart,
        saleInfo.saleEnd,
        saleInfo.fixedPrice,
        saleInfo.minPrice,
        saleInfo.maxPrice,
      ],
    });
    sendTransaction(transaction);
  };

  return { sendTx };
};

export const useMintExeToken = () => {
  const { mutateAsync: sendTransaction } = useSendTransaction();
  const sendTx = async (exeTokenAddress: string, to: string) => {
    const contract = exeTokenContract(exeTokenAddress);
    const transaction = prepareContractCall({
      contract: contract,
      method: EXE_TOKEN_ABI.abi.find((item) => item.name === "mint") as any,
      params: [to],
    });
    console.log("address", to);
    const result = await sendTransaction(transaction);
    return result.transactionHash;
  };

  return { sendTx };
};

export const useInitialMintExeToken = () => {
  const { mutateAsync: sendTransaction } = useSendTransaction();
  const sendTx = async (exeTokenAddress: string, tos: string[]) => {
    const contract = exeTokenContract(exeTokenAddress);
    const transaction = prepareContractCall({
      contract: contract,
      method: EXE_TOKEN_ABI.abi.find(
        (item) => item.name === "initialMint"
      ) as any,
      params: [tos],
    });
    const result = await sendTransaction(transaction);
    return result.transactionHash;
  };

  return { sendTx };
};

export const useVote = () => {
  const { mutate: sendTransaction } = useSendTransaction();
  const sendTx = async (
    proposalId: string,
    voteContractAddress: string,
    voteType: number
  ) => {
    const contract = voteContract(voteContractAddress);
    const transaction = prepareContractCall({
      contract: contract,
      method: "function vote(string calldata proposalId, uint8 voteType)",
      params: [proposalId, voteType],
    });
  };

  return { sendTx };
};

export const useCreateProposal = () => {
  const { mutate: sendTransaction } = useSendTransaction();
  const sendTx = async (voteContractAddress: string, executor: string) => {
    const contract = voteContract(voteContractAddress);
    const now = Math.floor(Date.now() / 1000);
    const transaction = prepareContractCall({
      contract: contract,
      method:
        "function createProposal(address executor, string memory proposalId, uint256 quorum, uint256 threshold, uint256 startTime, uint256 endTime)",
      params: [
        executor,
        "1",
        BigInt(10),
        BigInt(10),
        BigInt(now),
        BigInt(now + 30 * 24 * 60 * 60),
      ],
    });
    sendTransaction(transaction);
  };

  return { sendTx };
};

// read
export const useSmartCompanyId = (founderAddress: string) => {
  return useQuery<string, Error>({
    queryKey: ["smartCompanyId", founderAddress],
    queryFn: async () => {
      const result = await readContract({
        contract: scrProxyContract(),
        method: SCR_ABI.abi.find(
          (item) => item.name === "getSmartCompanyId"
        ) as any,
        params: [founderAddress],
      });
      return result;
    },
  });
};

export const useCompanyInfo = (founderAddress: string) => {
  return useQuery({
    queryKey: ["companyInfo", founderAddress],
    queryFn: async () => {
      const scId = await readContract({
        contract: scrProxyContract(),
        method: SCR_ABI.abi.find(
          (item) => item.name === "getSmartCompanyId"
        ) as any,
        params: [founderAddress],
      });
      console.log("scId", scId);
      const result = await readContract({
        contract: scrProxyContract(),
        method: SCR_ABI.abi.find(
          (item) => item.name === "getCompanyInfo"
        ) as any,
        params: [scId],
      });

      console.log("result", result);
      return result;
    },
  });
};

export const useExeTokenContract = (founderAddress: string) => {
  return useQuery<string, Error>({
    queryKey: ["exeTokenContract", founderAddress],
    queryFn: async () => {
      return (await readContract({
        contract: scrProxyContract(),
        method: SERVICE_FACTORY_ABI.abi.find(
          (item) => item.name === "getFounderService"
        ) as any,
        params: [founderAddress, 3],
      })) as string;
    },
  });
};

export const useNonExeTokenContract = (founderAddress: string) => {
  return useQuery<string, Error>({
    queryKey: ["nonExeTokenContract", founderAddress],
    queryFn: async () => {
      return (await readContract({
        contract: scrProxyContract(),
        method: SERVICE_FACTORY_ABI.abi.find(
          (item) => item.name === "getFounderService"
        ) as any,
        params: [founderAddress, 4],
      })) as string;
    },
  });
};

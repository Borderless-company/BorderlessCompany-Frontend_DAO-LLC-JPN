import { useQuery } from "@tanstack/react-query";
import { client } from "@/utils/client";
import {
  Address,
  getContract,
  prepareContractCall,
  readContract,
  estimateGas,
  toWei,
  eth_maxPriorityFeePerGas,
  eth_gasPrice,
  getRpcClient,
} from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { useSendTransaction, useActiveAccount } from "thirdweb/react";
import { SCR_PROXY_ADDRESS } from "@/constants";
import SCR_ABI from "@/utils/abi/SCR_V2.json";
import SERVICE_FACTORY_ABI from "@/utils/abi/ServiceFactory.json";
import VOTE_ABI from "@/utils/abi/Vote.json";
import EXE_TOKEN_ABI from "@/utils/abi/LETS_JP_LLC_EXE_V2.json";
import NON_EXE_TOKEN_ABI from "@/utils/abi/LETS_JP_LLC_NON_EXE.json";
import SALE_ABI from "@/utils/abi/LETS_JP_LLC_SALE.json";
import BORDERLESS_ACCESS_CONTROL_ABI from "@/utils/abi/BorderlessAccessControl.json";
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
    abi: JSON.parse(JSON.stringify(SCR_ABI.abi)),
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

export const accessControlContract = () => {
  return getContract({
    client,
    chain: defineChain(Number(process.env.NEXT_PUBLIC_CHAIN_ID)),
    address: SCR_PROXY_ADDRESS,
    abi: JSON.parse(JSON.stringify(BORDERLESS_ACCESS_CONTROL_ABI.abi)),
  });
};

// write

export const useSetContractURI = () => {
  const { mutateAsync: sendTransaction } = useSendTransaction();
  const activeAccount = useActiveAccount();
  const sendTx = async (smartAccount: string) => {
    const account = smartAccountContract(smartAccount);

    if (!account) return;

    const transaction = prepareContractCall({
      contract: account,
      method: "function setContractURI(string _uri)",
      params: [account.address],
    }) as any;

    // Estimate gas and apply 1.5x multiplier
    let gasLimit = BigInt(300000); // Default gas limit
    try {
      const gasEstimate = await estimateGas({
        transaction,
        account: activeAccount,
      });
      gasLimit = (gasEstimate * BigInt(15)) / BigInt(10);
    } catch (error) {
      console.warn("Gas estimation failed, using default gas limit:", error);
    }
    const txWithGas = { ...transaction, gas: gasLimit };

    const result = await sendTransaction(txWithGas);
    return result.transactionHash;
  };

  return { sendTx };
};

export const useCreateSmartCompany = () => {
  const { mutateAsync: sendTransaction } = useSendTransaction();
  const activeAccount = useActiveAccount();
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
    const rpcRequest = getRpcClient({
      client,
      chain: defineChain(Number(process.env.NEXT_PUBLIC_CHAIN_ID)),
    });
    const currentGasPrice = await eth_gasPrice(rpcRequest);
    const currentPriorityFee = await eth_maxPriorityFeePerGas(rpcRequest);
    console.log("currentGasPrice", currentGasPrice);
    console.log("currentPriorityFee", currentPriorityFee);
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
      maxPriorityFeePerGas: currentPriorityFee,
      maxFeePerGas: (currentGasPrice * BigInt(15)) / BigInt(10),
    });
    console.log("transaction", transaction);

    // Estimate gas and apply 1.5x multiplier
    console.log("will estimate gas");
    let gasLimit = BigInt(300000); // Default gas limit
    try {
      const gasEstimate = await estimateGas({
        transaction,
        account: activeAccount,
      });
      console.log("gasEstimate", gasEstimate);
      gasLimit = (gasEstimate * BigInt(15)) / BigInt(10);
      console.log("gasLimit", gasLimit);
    } catch (error) {
      console.warn("Gas estimation failed, using default gas limit:", error);
    }
    const txWithGas = {
      ...transaction,
      gas: gasLimit,
    };
    console.log("txWithGas", txWithGas);

    // トランザクションハッシュを返す
    const result = await sendTransaction(txWithGas);
    console.log("result", result);
    return result.transactionHash;
  };

  return { sendTx };
};

// TODO: 型直す
export const useSetSaleInfo = () => {
  const { mutate: sendTransaction } = useSendTransaction();
  const activeAccount = useActiveAccount();

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

    // Estimate gas and apply 1.5x multiplier
    let gasLimit = BigInt(300000);
    try {
      const gasEstimate = await estimateGas({
        transaction,
        account: activeAccount,
      });
      gasLimit = (gasEstimate * BigInt(15)) / BigInt(10);
    } catch (error) {
      console.warn("Gas estimation failed, using default gas limit:", error);
    }
    const txWithGas = { ...transaction, gas: gasLimit };

    sendTransaction(txWithGas);
  };

  return { sendTx };
};

export const useMintExeToken = () => {
  const { mutateAsync: sendTransaction } = useSendTransaction();
  const activeAccount = useActiveAccount();
  const sendTx = async (exeTokenAddress: string, to: string) => {
    const contract = exeTokenContract(exeTokenAddress);
    const transaction = prepareContractCall({
      contract: contract,
      method: EXE_TOKEN_ABI.abi.find((item) => item.name === "mint") as any,
      params: [to],
    });
    console.log("address", to);

    // Estimate gas and apply 1.5x multiplier
    let gasLimit = BigInt(300000);
    try {
      const gasEstimate = await estimateGas({
        transaction,
        account: activeAccount,
      });
      gasLimit = (gasEstimate * BigInt(15)) / BigInt(10);
    } catch (error) {
      console.warn("Gas estimation failed, using default gas limit:", error);
    }
    const txWithGas = { ...transaction, gas: gasLimit };

    const result = await sendTransaction(txWithGas);
    return result.transactionHash;
  };

  return { sendTx };
};

export const useInitialMintExeToken = () => {
  const { mutateAsync: sendTransaction } = useSendTransaction();
  const activeAccount = useActiveAccount();
  const sendTx = async (exeTokenAddress: string, tos: string[]) => {
    const contract = exeTokenContract(exeTokenAddress);
    const transaction = prepareContractCall({
      contract: contract,
      method: EXE_TOKEN_ABI.abi.find(
        (item) => item.name === "initialMint"
      ) as any,
      params: [tos],
    });

    // Estimate gas and apply 1.5x multiplier
    let gasLimit = BigInt(300000);
    try {
      const gasEstimate = await estimateGas({
        transaction,
        account: activeAccount,
      });
      gasLimit = (gasEstimate * BigInt(15)) / BigInt(10);
    } catch (error) {
      console.warn("Gas estimation failed, using default gas limit:", error);
    }
    const txWithGas = { ...transaction, gas: gasLimit };

    const result = await sendTransaction(txWithGas);
    return result.transactionHash;
  };

  return { sendTx };
};

export const useVote = () => {
  const { mutateAsync: sendTransaction } = useSendTransaction();
  const activeAccount = useActiveAccount();
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

    // Estimate gas and apply 1.5x multiplier
    let gasLimit = BigInt(300000);
    try {
      const gasEstimate = await estimateGas({
        transaction,
        account: activeAccount,
      });
      gasLimit = (gasEstimate * BigInt(15)) / BigInt(10);
    } catch (error) {
      console.warn("Gas estimation failed, using default gas limit:", error);
    }
    const txWithGas = { ...transaction, gas: gasLimit };

    const result = await sendTransaction(txWithGas);
    return result.transactionHash;
  };

  return { sendTx };
};

export const useCreateProposal = () => {
  const { mutateAsync: sendTransaction } = useSendTransaction();
  const activeAccount = useActiveAccount();
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

    // Estimate gas and apply 1.5x multiplier
    let gasLimit = BigInt(300000);
    try {
      const gasEstimate = await estimateGas({
        transaction,
        account: activeAccount,
      });
      gasLimit = (gasEstimate * BigInt(15)) / BigInt(10);
    } catch (error) {
      console.warn("Gas estimation failed, using default gas limit:", error);
    }
    const txWithGas = { ...transaction, gas: gasLimit };

    const result = await sendTransaction(txWithGas);
    return result.transactionHash;
  };

  return { sendTx };
};

export const useGrantRole = () => {
  const { mutateAsync: sendTransaction } = useSendTransaction();
  const activeAccount = useActiveAccount();
  const sendTx = async (role: string, account: string) => {
    const contract = accessControlContract();
    const transaction = prepareContractCall({
      contract: contract,
      method: BORDERLESS_ACCESS_CONTROL_ABI.abi.find(
        (item) => item.name === "grantRole"
      ) as any,
      params: [role, account],
    });

    // Estimate gas and apply 1.5x multiplier
    let gasLimit = BigInt(300000);
    try {
      const gasEstimate = await estimateGas({
        transaction,
        account: activeAccount,
      });
      gasLimit = (gasEstimate * BigInt(15)) / BigInt(10);
    } catch (error) {
      console.warn("Gas estimation failed, using default gas limit:", error);
    }
    const txWithGas = { ...transaction, gas: gasLimit };

    const result = await sendTransaction(txWithGas);
    return result.transactionHash;
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

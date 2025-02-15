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
import { SCR_CONTRACT_ADDRESS, SERVICE_FACTORY_ADDRESS } from "@/constants";
import SCR_ABI from "@/utils/abi/SCR.json";
import VOTE_ABI from "@/utils/abi/Vote.json";
import EXE_TOKEN_ABI from "@/utils/abi/LETS_JP_LLC_EXE.json";
import SERVICE_FACTORY_ABI from "@/utils/abi/ServiceFactory.json";

// contract

export const smartAccountContract = (smartAccount: string) => {
  return getContract({
    client,
    chain: defineChain(Number(process.env.NEXT_PUBLIC_CHAIN_ID)),
    address: smartAccount,
  });
};

const serviceFactoryContract = () => {
  return getContract({
    client,
    chain: defineChain(Number(process.env.NEXT_PUBLIC_CHAIN_ID)),
    address: SERVICE_FACTORY_ADDRESS,
    abi: JSON.parse(JSON.stringify(SERVICE_FACTORY_ABI.abi)),
  });
};

const scrContract = () => {
  return getContract({
    client,
    chain: defineChain(Number(process.env.NEXT_PUBLIC_CHAIN_ID)),
    address: SCR_CONTRACT_ADDRESS,
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

// write

export const useSetContractURI = () => {
  const { mutate: sendTransaction } = useSendTransaction();
  const sendTx = async (smartAccount: string) => {
    const account = smartAccountContract(smartAccount);

    if (!account) return;

    const transaction = prepareContractCall({
      contract: account,
      method: "function setContractURI(string _uri)",
      params: [account.address],
    }) as any;
    sendTransaction(transaction);
  };

  return { sendTx };
};

export const useExecuteTransaction = () => {
  const { mutate: sendTransaction } = useSendTransaction();
  const sendTx = async (
    smartAccount: string,
    target: Address,
    value: number,
    calldata: `0x${string}`
  ) => {
    const account = smartAccountContract(smartAccount);

    if (!account) return;

    const transaction = prepareContractCall({
      contract: account,
      method:
        "function execute(address _target, uint256 _value, bytes _calldata)",
      params: [target, BigInt(value), calldata],
    });
    console.log(JSON.stringify(transaction));
    sendTransaction(transaction);
  };

  return { sendTx };
};

export const useCreateCompany = () => {
  const { mutate: sendTransaction } = useSendTransaction();
  const sendTx = async (
    scId: string,
    scImplementation: string,
    legalEntityCode: string,
    companyName: string,
    establishmentDate: string,
    jurisdiction: string,
    entityType: string,
    scExtraParams: string,
    otherInfo: string[],
    scsAddresses: string[],
    scsExtraParams: string[]
  ) => {
    const contract = scrContract();
    const transaction = prepareContractCall({
      contract: contract,
      method:
        "function createSmartCompany(bytes calldata _scid, address _scImplementation, string calldata _legalEntityCode, string calldata _companyName, string calldata _establishmentDate, string calldata _jurisdiction,string calldata _entityType, bytes calldata _scExtraParams, string[] calldata _otherInfo, address[] calldata _scsAddresses, bytes[] calldata _scsExtraParams)",
      params: [
        scId as `0x${string}`,
        scImplementation,
        legalEntityCode,
        companyName,
        establishmentDate,
        jurisdiction,
        entityType,
        scExtraParams as `0x${string}`,
        otherInfo,
        scsAddresses as readonly `0x${string}`[],
        scsExtraParams as readonly `0x${string}`[],
      ],
    });
    sendTransaction(transaction);
  };

  return { sendTx };
};

export const useMintExeToken = () => {
  const { mutate: sendTransaction } = useSendTransaction();
  const sendTx = async (exeTokenAddress: string, to: string) => {
    const contract = exeTokenContract(exeTokenAddress);
    const transaction = prepareContractCall({
      contract: contract,
      method: "function mint(address to)",
      params: [to],
    });
    sendTransaction(transaction);
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
      method:
        "function vote(string calldata proposalId, uint8 voteType)",
      params: [proposalId, voteType],
    });
    sendTransaction(transaction);
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
      method: "function createProposal(address executor, string memory proposalId, uint256 quorum, uint256 threshold, uint256 startTime, uint256 endTime)",
      params: [executor, "1", BigInt(10), BigInt(10), BigInt(now), BigInt(now + 30 * 24 * 60 * 60)],
    });
    sendTransaction(transaction);
  };

  return { sendTx };
};

// read

export const useNftContract = (founderAddress: string) => {
  return useQuery({
    queryKey: ["nftContract", founderAddress],
    queryFn: async () => {
      return await readContract({
        contract: serviceFactoryContract(),
        method:
          "function getFounderServices(address founder_, uint8 serviceType_) returns (address)",
        params: [founderAddress, 2],
      });
    },
  });
};

export const useVoteContract = (founderAddress: string) => {
  return useQuery({
    queryKey: ["voteContract", founderAddress],
    queryFn: async () => {
      return await readContract({
        contract: scrContract(),
        method: "function getVoteContract(address founder_) returns (address)",
        params: [founderAddress],
      });
    },
  });
};

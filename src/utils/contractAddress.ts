import { Address } from "viem";

export const BlockExplorerUrl: { [chain: string]: string } = {
  Sepolia: "https://sepolia.etherscan.io",
  Amoy: "https://amoy.polygonscan.com",
};

export const RegisterBorderlessCompanyStartBlockNumber: {
  [chain: string]: number;
} = {
  Sepolia: 5701622,
  Amoy: 5886234,
};

export const MembershipTokenFactoryStartBlockNumber: {
  [chain: string]: number;
} = {
  Sepolia: 5735686,
  Amoy: 5886234,
};

export const WhitelistContractAddress: { [chain: string]: Address } = {
  Sepolia: "0x09FaFD544F9dc6656743A5C828FB7491E18bC41D",
  Amoy: "0xaFD8e809a7f7d7C6bcb67866938F721ff0D345C4",
};

export const RegisterBorderlessCompanyContractAddress: {
  [chain: string]: Address;
} = {
  Sepolia: "0x6F0A57e52f7Bb31D8b53ede1a148FE64247010d3",
  Amoy: "0x04E0240556Fd3673B7F1f4968ddB4B58475E208E",
};

// TODO: AmoyのTokenFactoryAddressを入れる
export const MembershipTokenFactoryContractAddress: {
  [chain: string]: Address;
} = {
  Sepolia: "0xBd05570A3eB660Df73d794F554C3011E1131d702",
  Amoy: "0xBd05570A3eB660Df73d794F554C3011E1131d702", // dummy
};

const chainIdToNetwork: { [chainId: number]: string } = {
  11155111: "Sepolia",
  80002: "Amoy",
};

const getNetwork = (chainId: number) => {
  const network = chainIdToNetwork[chainId];
  if (!network) {
    console.error("Invalid chainId");
  }
  return network;
};

export const getRegisterBorderlessCompanyStartBlockNumber = (
  chainId: number
): number => {
  return RegisterBorderlessCompanyStartBlockNumber[getNetwork(chainId)];
};

export const getMembershipTokenFactoryStartBlockNumber = (
  chainId: number
): number => {
  return MembershipTokenFactoryStartBlockNumber[getNetwork(chainId)];
};

export const getBlockExplorerUrl = (chainId: number): string => {
  return BlockExplorerUrl[getNetwork(chainId)];
};

export const getWhitelistContractAddress = (chainId: number): Address => {
  return WhitelistContractAddress[getNetwork(chainId)];
};

export const getRegisterBorderlessCompanyContractAddress = (
  chainId: number
): Address => {
  return RegisterBorderlessCompanyContractAddress[getNetwork(chainId)];
};

export const getMembershipTokenFactoryContractAddress = (
  chainId: number
): Address => {
  return MembershipTokenFactoryContractAddress[getNetwork(chainId)];
};

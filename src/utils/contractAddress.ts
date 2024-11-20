import { Address } from "viem";

export const BlockExplorerUrl: { [chain: string]: string } = {
  Sepolia: "https://sepolia.etherscan.io",
  Amoy: "https://amoy.polygonscan.com",
  MetisSepolia: "https://sepolia-explorer.metisdevops.link",
  MetisAndromeda: "https://andromeda-explorer.metis.io/",
};

export const RegisterBorderlessCompanyStartBlockNumber: {
  [chain: string]: number;
} = {
  Sepolia: 6833052,
  Amoy: 6833902,
  MetisSepolia: 1321185,
  MetisAndromeda: 18999587,
};

export const MembershipTokenFactoryStartBlockNumber: {
  [chain: string]: number;
} = {
  Sepolia: 6833902,
  Amoy: 6833902,
  MetisSepolia: 1321185,
  MetisAndromeda: 18999587,
};

// TODO: AmoyのWhitelistContractAddressを入れる
export const WhitelistContractAddress: { [chain: string]: Address } = {
  Sepolia: "0x9E6b1F2Db0b31d705993BAE80Fa622B904330b13",
  Amoy: "0xaFD8e809a7f7d7C6bcb67866938F721ff0D345C4",
};

// TODO: AmoyのRegisterBorderlessCompanyContractAddressを入れる
export const RegisterBorderlessCompanyContractAddress: {
  [chain: string]: Address;
} = {
  Sepolia: "0xE5f7fF8514C90e97aBc198B1B16cb979503D3EA9",
  // Sepolia: "0x3E60646B7Ea3F60750bf3e75008fdB48D6F6c521",
  Amoy: "0x04E0240556Fd3673B7F1f4968ddB4B58475E208E",
  MetisSepolia: "0x6EeB8AF621D8c35C05dEb759A813B4Af9B58E613",
};

// TODO: MembershipTokenFactoryContractAddressの機能を削除する
export const MembershipTokenFactoryContractAddress: {
  [chain: string]: Address;
} = {
  Sepolia: "0xbf9eA099551090A07D4171C22804888a210b79D9",
  Amoy: "0xBd05570A3eB660Df73d794F554C3011E1131d702", // dummy
  MetisSepolia: "0xFaA6b0F372f8effcc95f1581AaAaa4Afd8419ad5",
};

const chainIdToNetwork: { [chainId: number]: string } = {
  11155111: "Sepolia",
  80002: "Amoy",
  59902: "MetisSepolia",
  1088: "MetisAndromeda",
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

/**
 * Utility functions and constants for DropERC721 role management
 * 
 * This module provides easy-to-use functions for managing roles in Thirdweb DropERC721 contracts,
 * specifically for granting claimTo permissions to specific EOA addresses.
 */

import { getContract, readContract, prepareContractCall } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { client } from "@/utils/client";

// Standard role constants for DropERC721 contracts
export const DROPERC721_ROLES = {
  DEFAULT_ADMIN_ROLE: "0x0000000000000000000000000000000000000000000000000000000000000000",
  MINTER_ROLE: "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6", // keccak256("MINTER_ROLE")
  TRANSFER_ROLE: "0x8502233096d909befbda0999bb8ea2f3a6be3c138b9fbf003752a4c8bce86f6c", // keccak256("TRANSFER_ROLE")
  METADATA_ROLE: "0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775", // keccak256("METADATA_ROLE")
} as const;

// ABI definitions for role management functions
const ROLE_MANAGEMENT_ABI = [
  {
    "name": "hasRole",
    "type": "function",
    "stateMutability": "view",
    "inputs": [
      { "name": "role", "type": "bytes32" },
      { "name": "account", "type": "address" }
    ],
    "outputs": [{ "name": "", "type": "bool" }]
  },
  {
    "name": "grantRole",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "role", "type": "bytes32" },
      { "name": "account", "type": "address" }
    ],
    "outputs": []
  },
  {
    "name": "revokeRole",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "role", "type": "bytes32" },
      { "name": "account", "type": "address" }
    ],
    "outputs": []
  },
  {
    "name": "getRoleAdmin",
    "type": "function",
    "stateMutability": "view",
    "inputs": [
      { "name": "role", "type": "bytes32" }
    ],
    "outputs": [{ "name": "", "type": "bytes32" }]
  },
  {
    "name": "getRoleMemberCount",
    "type": "function",
    "stateMutability": "view",
    "inputs": [
      { "name": "role", "type": "bytes32" }
    ],
    "outputs": [{ "name": "", "type": "uint256" }]
  },
  {
    "name": "getRoleMember",
    "type": "function",
    "stateMutability": "view",
    "inputs": [
      { "name": "role", "type": "bytes32" },
      { "name": "index", "type": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "address" }]
  },
  {
    "name": "owner",
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address" }]
  }
] as const;

export const DROPERC721_ROLE_NAMES = {
  [DROPERC721_ROLES.DEFAULT_ADMIN_ROLE]: "Default Admin",
  [DROPERC721_ROLES.MINTER_ROLE]: "Minter",
  [DROPERC721_ROLES.TRANSFER_ROLE]: "Transfer",
  [DROPERC721_ROLES.METADATA_ROLE]: "Metadata",
} as const;

/**
 * Get a contract instance for the given address
 */
export const getDropERC721Contract = (contractAddress: string) => {
  return getContract({
    client,
    chain: defineChain(Number(process.env.NEXT_PUBLIC_CHAIN_ID)),
    address: contractAddress,
  });
};

/**
 * Check if an address has a specific role
 * @param contractAddress - The DropERC721 contract address
 * @param role - The role bytes32 value
 * @param account - The address to check
 * @returns Promise<boolean> - True if the address has the role
 */
export const hasDropERC721Role = async (
  contractAddress: string,
  role: string,
  account: string
): Promise<boolean> => {
  const contract = getDropERC721Contract(contractAddress);
  
  try {
    const result = await readContract({
      contract,
      method: ROLE_MANAGEMENT_ABI.find(item => item.name === "hasRole") as any,
      params: [role, account],
    });
    return result;
  } catch (error) {
    console.error("Error checking role:", error);
    return false;
  }
};

/**
 * Check if an address has MINTER_ROLE (claimTo permissions)
 * @param contractAddress - The DropERC721 contract address
 * @param account - The address to check
 * @returns Promise<boolean> - True if the address has minter role
 */
export const hasMinterRoleForClaimTo = async (
  contractAddress: string,
  account: string
): Promise<boolean> => {
  return hasDropERC721Role(contractAddress, DROPERC721_ROLES.MINTER_ROLE, account);
};

/**
 * Create a transaction to grant MINTER_ROLE to an address
 * @param contractAddress - The DropERC721 contract address
 * @param account - The address to grant the role to
 * @returns The prepared transaction object
 */
export const prepareGrantMinterRole = (contractAddress: string, account: string) => {
  const contract = getDropERC721Contract(contractAddress);
  
  return prepareContractCall({
    contract,
    method: ROLE_MANAGEMENT_ABI.find(item => item.name === "grantRole") as any,
    params: [DROPERC721_ROLES.MINTER_ROLE, account],
  });
};

/**
 * Create a transaction to revoke MINTER_ROLE from an address
 * @param contractAddress - The DropERC721 contract address
 * @param account - The address to revoke the role from
 * @returns The prepared transaction object
 */
export const prepareRevokeMinterRole = (contractAddress: string, account: string) => {
  const contract = getDropERC721Contract(contractAddress);
  
  return prepareContractCall({
    contract,
    method: ROLE_MANAGEMENT_ABI.find(item => item.name === "revokeRole") as any,
    params: [DROPERC721_ROLES.MINTER_ROLE, account],
  });
};

/**
 * Create a transaction to grant any role to an address
 * @param contractAddress - The DropERC721 contract address
 * @param role - The role bytes32 value
 * @param account - The address to grant the role to
 * @returns The prepared transaction object
 */
export const prepareGrantRole = (contractAddress: string, role: string, account: string) => {
  const contract = getDropERC721Contract(contractAddress);
  
  return prepareContractCall({
    contract,
    method: ROLE_MANAGEMENT_ABI.find(item => item.name === "grantRole") as any,
    params: [role, account],
  });
};

/**
 * Create a transaction to revoke any role from an address
 * @param contractAddress - The DropERC721 contract address
 * @param role - The role bytes32 value
 * @param account - The address to revoke the role from
 * @returns The prepared transaction object
 */
export const prepareRevokeRole = (contractAddress: string, role: string, account: string) => {
  const contract = getDropERC721Contract(contractAddress);
  
  return prepareContractCall({
    contract,
    method: ROLE_MANAGEMENT_ABI.find(item => item.name === "revokeRole") as any,
    params: [role, account],
  });
};

/**
 * Get all members for a specific role
 * @param contractAddress - The DropERC721 contract address
 * @param role - The role bytes32 value
 * @returns Promise<string[]> - Array of addresses that have the role
 */
export const getDropERC721RoleMembers = async (
  contractAddress: string,
  role: string
): Promise<string[]> => {
  const contract = getDropERC721Contract(contractAddress);
  
  try {
    const count = await readContract({
      contract,
      method: ROLE_MANAGEMENT_ABI.find(item => item.name === "getRoleMemberCount") as any,
      params: [role],
    });
    
    const members: string[] = [];

    for (let i = 0; i < Number(count); i++) {
      const member = await readContract({
        contract,
        method: ROLE_MANAGEMENT_ABI.find(item => item.name === "getRoleMember") as any,
        params: [role, BigInt(i)],
      });
      if (member) {
        members.push(member);
      }
    }

    return members;
  } catch (error) {
    console.error("Error getting role members:", error);
    return [];
  }
};

/**
 * Get all minter role members (addresses with claimTo permissions)
 * @param contractAddress - The DropERC721 contract address
 * @returns Promise<string[]> - Array of addresses that have minter role
 */
export const getMinterRoleMembers = async (contractAddress: string): Promise<string[]> => {
  return getDropERC721RoleMembers(contractAddress, DROPERC721_ROLES.MINTER_ROLE);
};

/**
 * Get the admin role for a specific role
 * @param contractAddress - The DropERC721 contract address
 * @param role - The role bytes32 value
 * @returns Promise<string> - The admin role bytes32 value
 */
export const getDropERC721RoleAdmin = async (
  contractAddress: string,
  role: string
): Promise<string> => {
  const contract = getDropERC721Contract(contractAddress);
  
  try {
    const result = await readContract({
      contract,
      method: ROLE_MANAGEMENT_ABI.find(item => item.name === "getRoleAdmin") as any,
      params: [role],
    });
    return result;
  } catch (error) {
    console.error("Error getting role admin:", error);
    return DROPERC721_ROLES.DEFAULT_ADMIN_ROLE;
  }
};

/**
 * Check if an address is the contract owner
 * @param contractAddress - The DropERC721 contract address
 * @param account - The address to check
 * @returns Promise<boolean> - True if the address is the owner
 */
export const isDropERC721Owner = async (
  contractAddress: string,
  account: string
): Promise<boolean> => {
  const contract = getDropERC721Contract(contractAddress);
  
  try {
    const owner = await readContract({
      contract,
      method: ROLE_MANAGEMENT_ABI.find(item => item.name === "owner") as any,
      params: [],
    });
    return owner?.toLowerCase() === account?.toLowerCase();
  } catch (error) {
    console.error("Error checking owner:", error);
    return false;
  }
};

/**
 * Utility function to format role names for display
 * @param role - The role bytes32 value
 * @returns The human-readable role name
 */
export const formatRoleName = (role: string): string => {
  return DROPERC721_ROLE_NAMES[role as keyof typeof DROPERC721_ROLE_NAMES] || role;
};

/**
 * Validate if a string is a valid Ethereum address
 * @param address - The address string to validate
 * @returns True if valid Ethereum address format
 */
export const isValidEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Helper function to get role constants by name
 * @param roleName - The role name (e.g., "MINTER_ROLE")
 * @returns The role bytes32 value or null if not found
 */
export const getRoleByName = (roleName: string): string | null => {
  const roleKey = roleName.toUpperCase() as keyof typeof DROPERC721_ROLES;
  return DROPERC721_ROLES[roleKey] || null;
};
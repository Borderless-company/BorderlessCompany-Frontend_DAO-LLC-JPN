import { useSendTransaction, useActiveAccount } from "thirdweb/react";
import { estimateGas } from "thirdweb";
import {
  DROPERC721_ROLES,
  DROPERC721_ROLE_NAMES,
  hasDropERC721Role,
  prepareGrantRole,
  prepareRevokeRole,
  getDropERC721RoleMembers,
  getDropERC721RoleAdmin,
} from "@/utils/dropERC721Roles";

// Re-export constants from utility module for backward compatibility
export const ROLES = DROPERC721_ROLES;
export const ROLE_NAMES = DROPERC721_ROLE_NAMES;

export const useDropERC721Roles = () => {
  const { mutateAsync: sendTransaction } = useSendTransaction();
  const activeAccount = useActiveAccount();

  /**
   * Grant a role to a specific address
   * @param contractAddress - The DropERC721 contract address
   * @param role - The role bytes32 value (use ROLES constants)
   * @param account - The address to grant the role to
   */
  const grantRoleToAddress = async (contractAddress: string, role: string, account: string) => {
    try {
      // Check if the caller has admin privileges for this role
      const roleAdmin = await getDropERC721RoleAdmin(contractAddress, role);
      const hasAdminRole = await hasDropERC721Role(contractAddress, roleAdmin, activeAccount?.address || "");

      if (!hasAdminRole) {
        throw new Error("Caller does not have admin privileges for this role");
      }

      // Check if the account already has the role
      const alreadyHasRole = await hasDropERC721Role(contractAddress, role, account);

      if (alreadyHasRole) {
        console.log(`Address ${account} already has role ${ROLE_NAMES[role as keyof typeof ROLE_NAMES] || role}`);
        return null;
      }

      // Grant the role
      const transaction = prepareGrantRole(contractAddress, role, account);

      // Estimate gas and apply 1.5x multiplier
      let gasLimit = BigInt(200000);
      try {
        const gasEstimate = await estimateGas({
          transaction,
          account: activeAccount,
        });
        gasLimit = (gasEstimate * BigInt(15)) / BigInt(10);
        console.log("Gas estimate for grantRole:", gasEstimate.toString(), "Using:", gasLimit.toString());
      } catch (error) {
        console.warn("Gas estimation failed, using default gas limit:", error);
      }

      const txWithGas = { ...transaction, gas: gasLimit };
      const result = await sendTransaction(txWithGas);
      
      console.log(`Role ${ROLE_NAMES[role as keyof typeof ROLE_NAMES] || role} granted to ${account}. Transaction hash:`, result.transactionHash);
      return result.transactionHash;

    } catch (error: any) {
      console.error("Error granting role:", error);
      const errorMessage = error.message || error.toString();
      
      if (errorMessage.includes("AccessControl")) {
        throw new Error("アクセス制御エラー: この操作を実行する権限がありません。");
      } else if (errorMessage.includes("InvalidRole")) {
        throw new Error("無効なロールです。");
      }
      
      throw error;
    }
  };

  /**
   * Revoke a role from a specific address
   * @param contractAddress - The DropERC721 contract address
   * @param role - The role bytes32 value (use ROLES constants)
   * @param account - The address to revoke the role from
   */
  const revokeRoleFromAddress = async (contractAddress: string, role: string, account: string) => {
    try {
      // Check if the caller has admin privileges for this role
      const roleAdmin = await getDropERC721RoleAdmin(contractAddress, role);
      const hasAdminRole = await hasDropERC721Role(contractAddress, roleAdmin, activeAccount?.address || "");

      if (!hasAdminRole) {
        throw new Error("Caller does not have admin privileges for this role");
      }

      // Check if the account actually has the role
      const hasTargetRole = await hasDropERC721Role(contractAddress, role, account);

      if (!hasTargetRole) {
        console.log(`Address ${account} does not have role ${ROLE_NAMES[role as keyof typeof ROLE_NAMES] || role}`);
        return null;
      }

      // Revoke the role
      const transaction = prepareRevokeRole(contractAddress, role, account);

      // Estimate gas and apply 1.5x multiplier
      let gasLimit = BigInt(200000);
      try {
        const gasEstimate = await estimateGas({
          transaction,
          account: activeAccount,
        });
        gasLimit = (gasEstimate * BigInt(15)) / BigInt(10);
        console.log("Gas estimate for revokeRole:", gasEstimate.toString(), "Using:", gasLimit.toString());
      } catch (error) {
        console.warn("Gas estimation failed, using default gas limit:", error);
      }

      const txWithGas = { ...transaction, gas: gasLimit };
      const result = await sendTransaction(txWithGas);
      
      console.log(`Role ${ROLE_NAMES[role as keyof typeof ROLE_NAMES] || role} revoked from ${account}. Transaction hash:`, result.transactionHash);
      return result.transactionHash;

    } catch (error: any) {
      console.error("Error revoking role:", error);
      throw error;
    }
  };

  /**
   * Check if an address has a specific role
   * @param contractAddress - The DropERC721 contract address
   * @param role - The role bytes32 value (use ROLES constants)
   * @param account - The address to check
   */
  const checkHasRole = async (contractAddress: string, role: string, account: string): Promise<boolean> => {
    try {
      return await hasDropERC721Role(contractAddress, role, account);
    } catch (error) {
      console.error("Error checking role:", error);
      return false;
    }
  };

  /**
   * Get the admin role for a specific role
   * @param contractAddress - The DropERC721 contract address
   * @param role - The role bytes32 value (use ROLES constants)
   */
  const getRoleAdminAddress = async (contractAddress: string, role: string): Promise<string> => {
    try {
      return await getDropERC721RoleAdmin(contractAddress, role);
    } catch (error) {
      console.error("Error getting role admin:", error);
      return ROLES.DEFAULT_ADMIN_ROLE;
    }
  };

  /**
   * Get the number of members for a specific role
   * @param contractAddress - The DropERC721 contract address
   * @param role - The role bytes32 value (use ROLES constants)
   */
  const getRoleMemberCountValue = async (contractAddress: string, role: string): Promise<number> => {
    try {
      const members = await getDropERC721RoleMembers(contractAddress, role);
      return members.length;
    } catch (error) {
      console.error("Error getting role member count:", error);
      return 0;
    }
  };

  /**
   * Get a specific role member by index
   * @param contractAddress - The DropERC721 contract address
   * @param role - The role bytes32 value (use ROLES constants)
   * @param index - The index of the member to retrieve
   */
  const getRoleMemberAtIndex = async (contractAddress: string, role: string, index: number): Promise<string> => {
    try {
      const members = await getDropERC721RoleMembers(contractAddress, role);
      return members[index] || "";
    } catch (error) {
      console.error("Error getting role member:", error);
      return "";
    }
  };

  /**
   * Get all members for a specific role
   * @param contractAddress - The DropERC721 contract address
   * @param role - The role bytes32 value (use ROLES constants)
   */
  const getAllRoleMembersForRole = async (contractAddress: string, role: string): Promise<string[]> => {
    try {
      return await getDropERC721RoleMembers(contractAddress, role);
    } catch (error) {
      console.error("Error getting all role members:", error);
      return [];
    }
  };

  /**
   * Grant MINTER_ROLE to an address (convenience function for claimTo permissions)
   * @param contractAddress - The DropERC721 contract address
   * @param account - The address to grant minter role to
   */
  const grantMinterRole = async (contractAddress: string, account: string) => {
    return grantRoleToAddress(contractAddress, ROLES.MINTER_ROLE, account);
  };

  /**
   * Revoke MINTER_ROLE from an address
   * @param contractAddress - The DropERC721 contract address
   * @param account - The address to revoke minter role from
   */
  const revokeMinterRole = async (contractAddress: string, account: string) => {
    return revokeRoleFromAddress(contractAddress, ROLES.MINTER_ROLE, account);
  };

  /**
   * Check if an address has MINTER_ROLE
   * @param contractAddress - The DropERC721 contract address
   * @param account - The address to check
   */
  const hasMinterRole = async (contractAddress: string, account: string): Promise<boolean> => {
    return checkHasRole(contractAddress, ROLES.MINTER_ROLE, account);
  };

  return {
    // Generic role functions
    grantRoleToAddress,
    revokeRoleFromAddress,
    checkHasRole,
    getRoleAdminAddress,
    getRoleMemberCountValue,
    getRoleMemberAtIndex,
    getAllRoleMembersForRole,
    
    // Minter role specific functions (for claimTo permissions)
    grantMinterRole,
    revokeMinterRole,
    hasMinterRole,
    
    // Constants
    ROLES,
    ROLE_NAMES,
  };
};
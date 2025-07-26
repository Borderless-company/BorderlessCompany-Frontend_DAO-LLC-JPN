# DropERC721 Role Management Guide

This guide explains how to grant claimTo permissions to specific EOA addresses in Thirdweb DropERC721 contracts using the role-based access control functions provided in this codebase.

## Overview

The DropERC721 contract uses role-based access control to manage permissions. The most important role for claimTo permissions is `MINTER_ROLE`. Any address with `MINTER_ROLE` can execute the `claimTo` function to mint tokens to any address.

## Role Constants

```typescript
export const DROPERC721_ROLES = {
  DEFAULT_ADMIN_ROLE: "0x0000000000000000000000000000000000000000000000000000000000000000",
  MINTER_ROLE: "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6", // keccak256("MINTER_ROLE")
  TRANSFER_ROLE: "0x8502233096d909befbda0999bb8ea2f3a6be3c138b9fbf003752a4c8bce86f6c", // keccak256("TRANSFER_ROLE")
  METADATA_ROLE: "0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775", // keccak256("METADATA_ROLE")
};
```

## Available Functions

### 1. Utility Functions (`/src/utils/dropERC721Roles.ts`)

These are low-level utility functions that can be used directly:

#### Check if an address has MINTER_ROLE
```typescript
import { hasMinterRoleForClaimTo } from "@/utils/dropERC721Roles";

const hasPermission = await hasMinterRoleForClaimTo(contractAddress, userAddress);
```

#### Prepare transactions for granting/revoking roles
```typescript
import { 
  prepareGrantMinterRole, 
  prepareRevokeMinterRole 
} from "@/utils/dropERC721Roles";

// Prepare transaction to grant MINTER_ROLE
const grantTransaction = prepareGrantMinterRole(contractAddress, targetAddress);

// Prepare transaction to revoke MINTER_ROLE
const revokeTransaction = prepareRevokeMinterRole(contractAddress, targetAddress);
```

#### Get all addresses with MINTER_ROLE
```typescript
import { getMinterRoleMembers } from "@/utils/dropERC721Roles";

const minterAddresses = await getMinterRoleMembers(contractAddress);
console.log("Addresses with minter role:", minterAddresses);
```

### 2. React Hook (`/src/hooks/useDropERC721Roles.ts`)

This hook provides a React-friendly interface with automatic transaction handling:

```typescript
import { useDropERC721Roles } from "@/hooks/useDropERC721Roles";

const { grantMinterRole, revokeMinterRole, hasMinterRole } = useDropERC721Roles();

// Grant MINTER_ROLE to an address
const handleGrantRole = async () => {
  try {
    const txHash = await grantMinterRole(contractAddress, targetAddress);
    console.log("Role granted! Transaction:", txHash);
  } catch (error) {
    console.error("Failed to grant role:", error);
  }
};

// Check if address has MINTER_ROLE
const checkPermission = async () => {
  const hasRole = await hasMinterRole(contractAddress, addressToCheck);
  console.log("Has minter role:", hasRole);
};
```

### 3. UI Component (`/src/components/tokens/TokenRoleManager.tsx`)

A complete UI component for managing roles in the token detail page:

```typescript
import { TokenRoleManager } from "@/components/tokens/TokenRoleManager";

// Use in your component
<TokenRoleManager contractAddress={token.contract_address} />
```

## Step-by-Step Implementation Guide

### Step 1: Basic Role Check

First, check if an address has the required permissions:

```typescript
import { hasMinterRoleForClaimTo } from "@/utils/dropERC721Roles";

const contractAddress = "0x..."; // Your DropERC721 contract address
const userAddress = "0x...";     // Address to check

const canClaim = await hasMinterRoleForClaimTo(contractAddress, userAddress);

if (canClaim) {
  console.log("Address can execute claimTo");
} else {
  console.log("Address needs MINTER_ROLE to execute claimTo");
}
```

### Step 2: Grant MINTER_ROLE

To grant claimTo permissions to an EOA address:

```typescript
import { useSendTransaction } from "thirdweb/react";
import { prepareGrantMinterRole, estimateGas } from "@/utils/dropERC721Roles";

const { mutateAsync: sendTransaction } = useSendTransaction();

const grantClaimPermission = async (contractAddress: string, targetAddress: string) => {
  try {
    // Prepare the transaction
    const transaction = prepareGrantMinterRole(contractAddress, targetAddress);
    
    // Estimate gas and apply multiplier
    let gasLimit = BigInt(200000);
    try {
      const gasEstimate = await estimateGas({
        transaction,
        account: activeAccount,
      });
      gasLimit = (gasEstimate * BigInt(15)) / BigInt(10);
    } catch (error) {
      console.warn("Gas estimation failed, using default gas limit");
    }

    // Send transaction
    const txWithGas = { ...transaction, gas: gasLimit };
    const result = await sendTransaction(txWithGas);
    
    console.log("MINTER_ROLE granted! Transaction:", result.transactionHash);
    return result.transactionHash;
  } catch (error) {
    console.error("Failed to grant MINTER_ROLE:", error);
    throw error;
  }
};
```

### Step 3: Using the React Hook (Recommended)

The easiest way is to use the provided React hook:

```typescript
import { useDropERC721Roles } from "@/hooks/useDropERC721Roles";

const MyComponent = ({ contractAddress }) => {
  const { grantMinterRole, revokeMinterRole, hasMinterRole } = useDropERC721Roles();
  const [targetAddress, setTargetAddress] = useState("");

  const handleGrantPermission = async () => {
    try {
      const txHash = await grantMinterRole(contractAddress, targetAddress);
      alert(`Permission granted! TX: ${txHash}`);
    } catch (error) {
      alert(`Failed: ${error.message}`);
    }
  };

  return (
    <div>
      <input 
        value={targetAddress} 
        onChange={(e) => setTargetAddress(e.target.value)}
        placeholder="0x... address to grant permission"
      />
      <button onClick={handleGrantPermission}>
        Grant ClaimTo Permission
      </button>
    </div>
  );
};
```

### Step 4: Complete UI Integration

For a complete solution, use the TokenRoleManager component in your token detail page:

```typescript
// In TokenDetailPage.tsx
import { TokenRoleManager } from "@/components/tokens/TokenRoleManager";

// Add as a new tab
<Tab key="role-management" title="権限管理">
  <TokenRoleManager contractAddress={token.contract_address} />
</Tab>
```

## Important Notes

### 1. Permission Requirements

- Only addresses with `DEFAULT_ADMIN_ROLE` or the admin role for `MINTER_ROLE` can grant/revoke the `MINTER_ROLE`
- By default, the contract deployer has `DEFAULT_ADMIN_ROLE`
- The contract owner automatically has administrative privileges

### 2. Gas Considerations

- Role management functions require gas for execution
- The code automatically estimates gas and applies a 1.5x multiplier for safety
- Failed gas estimation falls back to default limits

### 3. Error Handling

The functions provide comprehensive error handling:

```typescript
try {
  await grantMinterRole(contractAddress, targetAddress);
} catch (error) {
  if (error.message.includes("AccessControl")) {
    console.log("Caller doesn't have permission to grant roles");
  } else if (error.message.includes("already has role")) {
    console.log("Address already has the required role");
  } else {
    console.log("Unexpected error:", error.message);
  }
}
```

### 4. Security Best Practices

- Always validate Ethereum addresses before granting roles
- Verify that the caller has the necessary permissions
- Log all role changes for audit purposes
- Consider implementing time-locked role changes for critical permissions

## Example: Complete Implementation

Here's a complete example showing how to implement claimTo permission management:

```typescript
import React, { useState, useEffect } from 'react';
import { useDropERC721Roles } from "@/hooks/useDropERC721Roles";
import { getMinterRoleMembers } from "@/utils/dropERC721Roles";

const ClaimPermissionManager = ({ contractAddress }) => {
  const [targetAddress, setTargetAddress] = useState("");
  const [minterAddresses, setMinterAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { grantMinterRole, revokeMinterRole, hasMinterRole } = useDropERC721Roles();

  // Load current minter addresses
  useEffect(() => {
    const loadMinters = async () => {
      const addresses = await getMinterRoleMembers(contractAddress);
      setMinterAddresses(addresses);
    };
    loadMinters();
  }, [contractAddress]);

  const handleGrantPermission = async () => {
    if (!targetAddress) return;
    
    setIsLoading(true);
    try {
      // Check if already has role
      const hasRole = await hasMinterRole(contractAddress, targetAddress);
      if (hasRole) {
        alert("Address already has claimTo permission");
        return;
      }

      // Grant the role
      const txHash = await grantMinterRole(contractAddress, targetAddress);
      alert(`ClaimTo permission granted! Transaction: ${txHash}`);
      
      // Refresh the list
      const updatedAddresses = await getMinterRoleMembers(contractAddress);
      setMinterAddresses(updatedAddresses);
      setTargetAddress("");
    } catch (error) {
      alert(`Failed to grant permission: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokePermission = async (address) => {
    setIsLoading(true);
    try {
      const txHash = await revokeMinterRole(contractAddress, address);
      alert(`Permission revoked! Transaction: ${txHash}`);
      
      // Refresh the list
      const updatedAddresses = await getMinterRoleMembers(contractAddress);
      setMinterAddresses(updatedAddresses);
    } catch (error) {
      alert(`Failed to revoke permission: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h3>ClaimTo Permission Management</h3>
      
      {/* Grant Permission Section */}
      <div>
        <h4>Grant ClaimTo Permission</h4>
        <input
          type="text"
          value={targetAddress}
          onChange={(e) => setTargetAddress(e.target.value)}
          placeholder="0x... Ethereum address"
        />
        <button 
          onClick={handleGrantPermission} 
          disabled={!targetAddress || isLoading}
        >
          Grant Permission
        </button>
      </div>

      {/* Current Permissions Section */}
      <div>
        <h4>Addresses with ClaimTo Permission</h4>
        {minterAddresses.length > 0 ? (
          <ul>
            {minterAddresses.map((address, index) => (
              <li key={index}>
                {address}
                <button 
                  onClick={() => handleRevokePermission(address)}
                  disabled={isLoading}
                >
                  Revoke
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No addresses have claimTo permission</p>
        )}
      </div>
    </div>
  );
};

export default ClaimPermissionManager;
```

This comprehensive guide should provide everything needed to implement claimTo permission management for DropERC721 contracts in the Borderless DAO application.
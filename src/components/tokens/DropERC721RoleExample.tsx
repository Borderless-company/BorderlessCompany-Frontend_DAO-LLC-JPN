/**
 * Example component demonstrating how to use DropERC721 role management functions
 * 
 * This component shows practical examples of:
 * 1. Checking if an address has MINTER_ROLE (claimTo permissions)
 * 2. Granting MINTER_ROLE to a specific EOA address
 * 3. Revoking MINTER_ROLE from an address
 * 4. Listing all addresses with MINTER_ROLE
 */

import { FC, useState, useEffect } from "react";
import { Button, Input, Card, CardBody, CardHeader, Chip } from "@heroui/react";
import { useSendTransaction, useActiveAccount } from "thirdweb/react";
import {
  DROPERC721_ROLES,
  hasMinterRoleForClaimTo,
  prepareGrantMinterRole,
  prepareRevokeMinterRole,
  getMinterRoleMembers,
  isDropERC721Owner,
  isValidEthereumAddress,
} from "@/utils/dropERC721Roles";
import { estimateGas } from "thirdweb";

export type DropERC721RoleExampleProps = {
  contractAddress: string;
};

export const DropERC721RoleExample: FC<DropERC721RoleExampleProps> = ({
  contractAddress,
}) => {
  const [checkAddress, setCheckAddress] = useState("");
  const [grantAddress, setGrantAddress] = useState("");
  const [revokeAddress, setRevokeAddress] = useState("");
  const [hasRole, setHasRole] = useState<boolean | null>(null);
  const [minterMembers, setMinterMembers] = useState<string[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { mutateAsync: sendTransaction } = useSendTransaction();
  const activeAccount = useActiveAccount();

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      if (contractAddress && activeAccount?.address) {
        try {
          const [ownerStatus, members] = await Promise.all([
            isDropERC721Owner(contractAddress, activeAccount.address),
            getMinterRoleMembers(contractAddress),
          ]);
          setIsOwner(ownerStatus);
          setMinterMembers(members);
        } catch (error) {
          console.error("Error loading data:", error);
        }
      }
    };
    loadData();
  }, [contractAddress, activeAccount?.address]);

  // Check if address has MINTER_ROLE
  const handleCheckRole = async () => {
    if (!checkAddress || !isValidEthereumAddress(checkAddress)) {
      alert("有効なEthereumアドレスを入力してください");
      return;
    }

    setIsLoading(true);
    try {
      const result = await hasMinterRoleForClaimTo(contractAddress, checkAddress);
      setHasRole(result);
    } catch (error) {
      console.error("Error checking role:", error);
      alert("ロールチェックに失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // Grant MINTER_ROLE to address
  const handleGrantRole = async () => {
    if (!grantAddress || !isValidEthereumAddress(grantAddress)) {
      alert("有効なEthereumアドレスを入力してください");
      return;
    }

    if (!isOwner && !activeAccount?.address) {
      alert("この操作を実行する権限がありません");
      return;
    }

    setIsLoading(true);
    try {
      // Check if address already has the role
      const alreadyHasRole = await hasMinterRoleForClaimTo(contractAddress, grantAddress);
      if (alreadyHasRole) {
        alert("このアドレスは既にMINTER_ROLEを持っています");
        return;
      }

      // Prepare the transaction
      const transaction = prepareGrantMinterRole(contractAddress, grantAddress);

      // Estimate gas and apply multiplier
      let gasLimit = BigInt(200000);
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

      alert(`MINTER_ROLE付与成功! TX: ${result.transactionHash}`);
      setGrantAddress("");
      
      // Refresh member list
      const updatedMembers = await getMinterRoleMembers(contractAddress);
      setMinterMembers(updatedMembers);

    } catch (error: any) {
      console.error("Error granting role:", error);
      alert(`ロール付与に失敗しました: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Revoke MINTER_ROLE from address
  const handleRevokeRole = async () => {
    if (!revokeAddress || !isValidEthereumAddress(revokeAddress)) {
      alert("有効なEthereumアドレスを入力してください");
      return;
    }

    if (!isOwner && !activeAccount?.address) {
      alert("この操作を実行する権限がありません");
      return;
    }

    setIsLoading(true);
    try {
      // Check if address actually has the role
      const actuallyHasRole = await hasMinterRoleForClaimTo(contractAddress, revokeAddress);
      if (!actuallyHasRole) {
        alert("このアドレスはMINTER_ROLEを持っていません");
        return;
      }

      // Prepare the transaction
      const transaction = prepareRevokeMinterRole(contractAddress, revokeAddress);

      // Estimate gas and apply multiplier
      let gasLimit = BigInt(200000);
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

      alert(`MINTER_ROLE取り消し成功! TX: ${result.transactionHash}`);
      setRevokeAddress("");
      
      // Refresh member list
      const updatedMembers = await getMinterRoleMembers(contractAddress);
      setMinterMembers(updatedMembers);

    } catch (error: any) {
      console.error("Error revoking role:", error);
      alert(`ロール取り消しに失敗しました: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">DropERC721 Role Management Example</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Contract Information</h4>
            <p className="text-sm text-blue-700 font-mono">{contractAddress}</p>
            <p className="text-sm text-blue-700">
              Your Status: {isOwner ? "Owner" : "Regular User"}
            </p>
            <p className="text-sm text-blue-700">
              MINTER_ROLE: {DROPERC721_ROLES.MINTER_ROLE}
            </p>
          </div>

          {/* Check Role Section */}
          <div className="space-y-2">
            <h4 className="font-medium">1. Check if Address has MINTER_ROLE (claimTo permissions)</h4>
            <div className="flex gap-2">
              <Input
                placeholder="0x... (チェック対象アドレス)"
                value={checkAddress}
                onValueChange={setCheckAddress}
                className="flex-1"
              />
              <Button
                color="primary"
                onPress={handleCheckRole}
                isLoading={isLoading}
                isDisabled={!checkAddress}
              >
                チェック
              </Button>
            </div>
            {hasRole !== null && (
              <Chip color={hasRole ? "success" : "danger"} size="sm">
                {hasRole ? "MINTER_ROLEを持っています" : "MINTER_ROLEを持っていません"}
              </Chip>
            )}
          </div>

          {/* Grant Role Section */}
          <div className="space-y-2">
            <h4 className="font-medium">2. Grant MINTER_ROLE to Address</h4>
            <div className="flex gap-2">
              <Input
                placeholder="0x... (付与先アドレス)"
                value={grantAddress}
                onValueChange={setGrantAddress}
                className="flex-1"
              />
              <Button
                color="success"
                onPress={handleGrantRole}
                isLoading={isLoading}
                isDisabled={!grantAddress || !isOwner}
              >
                ロール付与
              </Button>
            </div>
            {!isOwner && (
              <p className="text-sm text-danger">※ オーナーのみがロールを付与できます</p>
            )}
          </div>

          {/* Revoke Role Section */}
          <div className="space-y-2">
            <h4 className="font-medium">3. Revoke MINTER_ROLE from Address</h4>
            <div className="flex gap-2">
              <Input
                placeholder="0x... (取り消し対象アドレス)"
                value={revokeAddress}
                onValueChange={setRevokeAddress}
                className="flex-1"
              />
              <Button
                color="danger"
                onPress={handleRevokeRole}
                isLoading={isLoading}
                isDisabled={!revokeAddress || !isOwner}
              >
                ロール取り消し
              </Button>
            </div>
            {!isOwner && (
              <p className="text-sm text-danger">※ オーナーのみがロールを取り消しできます</p>
            )}
          </div>

          {/* Members List Section */}
          <div className="space-y-2">
            <h4 className="font-medium">4. Current MINTER_ROLE Members</h4>
            <div className="bg-gray-50 rounded-lg p-3">
              {minterMembers.length > 0 ? (
                <div className="space-y-1">
                  {minterMembers.map((member, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-mono text-sm">{member}</span>
                      <Chip size="sm" color="success">MINTER</Chip>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">MINTER_ROLEを持つアドレスがありません</p>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
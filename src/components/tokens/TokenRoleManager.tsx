import { FC, useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Link,
  Select,
  SelectItem,
} from "@heroui/react";
import {
  useDropERC721Roles,
  ROLES,
  ROLE_NAMES,
} from "@/hooks/useDropERC721Roles";
import { useActiveAccount } from "thirdweb/react";

export type TokenRoleManagerProps = {
  contractAddress: string;
};

export const TokenRoleManager: FC<TokenRoleManagerProps> = ({
  contractAddress,
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isRevokeOpen,
    onOpen: onRevokeOpen,
    onOpenChange: onRevokeOpenChange,
  } = useDisclosure();

  const [newRoleAddress, setNewRoleAddress] = useState("");
  const [selectedRole, setSelectedRole] = useState(ROLES.MINTER_ROLE);
  const [isGranting, setIsGranting] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Role members state
  const [roleMembersData, setRoleMembersData] = useState<
    Record<string, string[]>
  >({});
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [selectedRevokeRole, setSelectedRevokeRole] = useState("");
  const [selectedRevokeAddress, setSelectedRevokeAddress] = useState("");

  const activeAccount = useActiveAccount();
  const {
    grantRoleToAddress,
    revokeRoleFromAddress,
    getAllRoleMembersForRole,
    checkHasRole,
    grantMinterRole,
    revokeMinterRole,
    hasMinterRole,
    ROLE_NAMES: roleNames,
  } = useDropERC721Roles();

  // Load all role members
  const loadRoleMembers = async () => {
    setIsLoadingMembers(true);
    try {
      const allRoleMembers: Record<string, string[]> = {};

      for (const [roleKey, roleValue] of Object.entries(ROLES)) {
        const members = await getAllRoleMembersForRole(
          contractAddress,
          roleValue
        );
        allRoleMembers[roleValue] = members;
      }

      setRoleMembersData(allRoleMembers);
    } catch (error) {
      console.error("Error loading role members:", error);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  useEffect(() => {
    if (contractAddress) {
      loadRoleMembers();
    }
  }, [contractAddress]);

  const handleGrantRole = async () => {
    if (!newRoleAddress || !selectedRole) return;

    setIsGranting(true);
    setTxHash(null);
    setErrorMessage(null);

    try {
      const hash = await grantRoleToAddress(
        contractAddress,
        selectedRole,
        newRoleAddress
      );
      if (hash) {
        setTxHash(hash);
        setNewRoleAddress("");
        await loadRoleMembers(); // Refresh the member list
      }
    } catch (error: any) {
      console.error("Grant role failed:", error);
      setErrorMessage(error.message || "ロール付与に失敗しました");
    } finally {
      setIsGranting(false);
    }
  };

  const handleRevokeRole = async () => {
    if (!selectedRevokeRole || !selectedRevokeAddress) return;

    setIsRevoking(true);
    setTxHash(null);
    setErrorMessage(null);

    try {
      const hash = await revokeRoleFromAddress(
        contractAddress,
        selectedRevokeRole,
        selectedRevokeAddress
      );
      if (hash) {
        setTxHash(hash);
        setSelectedRevokeRole("");
        setSelectedRevokeAddress("");
        await loadRoleMembers(); // Refresh the member list
        onRevokeOpenChange();
      }
    } catch (error: any) {
      console.error("Revoke role failed:", error);
      setErrorMessage(error.message || "ロール取り消しに失敗しました");
    } finally {
      setIsRevoking(false);
    }
  };

  const handleQuickGrantMinter = async (address: string) => {
    setTxHash(null);
    setErrorMessage(null);

    try {
      const hash = await grantMinterRole(contractAddress, address);
      if (hash) {
        setTxHash(hash);
        await loadRoleMembers();
      }
    } catch (error: any) {
      console.error("Quick grant minter failed:", error);
      setErrorMessage(error.message || "MINTER_ROLE付与に失敗しました");
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Actions for Minter Role */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">
              🛡️ クレーム権限管理 (MINTER_ROLE)
            </h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-3">
          <p className="text-sm text-neutral">
            MINTER_ROLEを持つアドレスは、このトークンのclaimTo機能を実行できます。
          </p>

          <div className="flex gap-2">
            <Input
              placeholder="0x... (グラント先アドレス)"
              value={newRoleAddress}
              onValueChange={setNewRoleAddress}
              className="flex-1"
              size="sm"
            />
            <Button
              color="primary"
              size="sm"
              onPress={() => handleQuickGrantMinter(newRoleAddress)}
              isDisabled={!newRoleAddress || !activeAccount}
            >
              MINTER付与
            </Button>
          </div>

          {/* Success/Error Messages */}
          {txHash && (
            <div className="bg-success-50 border border-success-200 rounded-lg p-3">
              <p className="text-sm text-success-700 mb-1">ロール付与成功！</p>
              <Link
                color="success"
                isExternal
                showAnchorIcon
                href={`${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${txHash}`}
                className="font-mono text-xs"
              >
                {txHash.slice(0, 10)}...{txHash.slice(-8)}
              </Link>
            </div>
          )}

          {errorMessage && (
            <div className="bg-danger-50 border border-danger-200 rounded-lg p-3">
              <p className="text-sm text-danger-700">{errorMessage}</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Grant Role Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>ロールを付与</ModalHeader>
              <ModalBody className="space-y-4">
                <Select
                  label="ロール"
                  selectedKeys={[selectedRole]}
                  onSelectionChange={(keys) => {
                    const key = Array.from(keys)[0] as string;
                    setSelectedRole(key as any);
                  }}
                >
                  {Object.entries(ROLES).map(([roleKey, roleValue]) => (
                    <SelectItem key={roleValue} value={roleValue}>
                      {roleNames[roleValue as keyof typeof roleNames] ||
                        roleKey}
                    </SelectItem>
                  ))}
                </Select>

                <Input
                  label="アドレス"
                  placeholder="0x..."
                  value={newRoleAddress}
                  onValueChange={setNewRoleAddress}
                  description="ロールを付与するウォレットアドレス"
                />

                <div className="bg-default-100 p-3 rounded-lg">
                  <p className="text-sm font-medium mb-1">選択されたロール:</p>
                  <p className="text-xs font-mono text-neutral">
                    {selectedRole}
                  </p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  キャンセル
                </Button>
                <Button
                  color="primary"
                  onPress={handleGrantRole}
                  isLoading={isGranting}
                  isDisabled={!newRoleAddress || !selectedRole}
                >
                  ロール付与
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

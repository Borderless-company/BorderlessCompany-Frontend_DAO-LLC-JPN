import { Stack } from "@/sphere/Stack";
import { Button, Link, Tab, Tabs, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, useDisclosure } from "@heroui/react";
import Image from "next/image";
import { FC, useState } from "react";
import MemberList from "../members/MemberList";
import { useToken } from "@/hooks/useToken";
import { TokenSales } from "./TokenSales";
import { TokenTypeChip } from "./TokenTypeChip";
import { TokenRoleManager } from "./TokenRoleManager";
import { useDropERC721Mint } from "@/hooks/useDropERC721";
import { useActiveAccount } from "thirdweb/react";

export type TokenDetailPageProps = {
  companyId: string;
  tokenId: string;
};

export const TokenDetailPage: FC<TokenDetailPageProps> = ({
  companyId,
  tokenId,
}) => {
  const { token, isLoadingToken } = useToken(tokenId);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [mintAddress, setMintAddress] = useState("");
  const [mintQuantity, setMintQuantity] = useState("1");
  const [isMinting, setIsMinting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const { mintTo } = useDropERC721Mint();
  const activeAccount = useActiveAccount();

  if (isLoadingToken) {
    return (
      <div className="w-full h-full flex items-start justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <main className="w-full h-full overflow-scroll px-6 pt-4 flex gap-4">
      {/* left column */}
      <div className="w-60 h-fit flex-shrink-0 flex flex-col gap-4">
        <Image
          src={token?.image || "/globe.png"}
          width={240}
          height={240}
          alt="logo"
          className="rounded-lg object-cover"
        />
        <Stack className="gap-1">
          <p className="font-label-lg text-neutral ">
            {token?.symbol || "未設定"}
          </p>
          <h2 className="font-title-lg text-foreground ">
            {token?.name || "未設定"}
          </h2>
          {token?.is_executable !== null && (
            <TokenTypeChip
              isExecutable={token?.is_executable ?? false}
              size="sm"
              className="rounded-md z-20"
            />
          )}
        </Stack>

        <Stack className="gap-1">
          <p className="font-label-md text-neutral">説明文</p>
          <p className="font-body-md text-foreground">
            {token?.description || "未設定"}
          </p>
        </Stack>
        <Stack className="gap-1">
          <p className="font-label-md text-neutral">コントラクトアドレス</p>
          <Link
            color="primary"
            isExternal
            showAnchorIcon
            href={`${process.env.NEXT_PUBLIC_EXPLORER_URL}/address/${token?.contract_address}`}
            className="font-body-md w-full"
          >
            <span className="w-full text-ellipsis overflow-hidden ">
              {token?.contract_address || "未設定"}
            </span>
          </Link>
        </Stack>
        {token?.contract_address && (
          <Button
            color="primary"
            onPress={onOpen}
            className="w-full"
            isDisabled={!activeAccount}
          >
            Mint
          </Button>
        )}
      </div>
      {/* right column */}
      <div className="flex-1 h-full overflow-auto">
        <Tabs
          aria-label="Token Tabs"
          color="primary"
          variant="bordered"
          className="w-full"
          size="lg"
        >
          <Tab key="holders" title="保有者一覧" className="overflow-auto">
            <MemberList
              companyId={companyId}
              filter={token?.is_executable ? "executive" : "non-executive"}
            />
          </Tab>
          <Tab key="token-sales" title="トークン販売" className="overflow-auto">
            <TokenSales companyId={companyId} tokenId={tokenId} />
          </Tab>
          {token?.contract_address && (
            <Tab key="role-management" title="権限管理" className="overflow-auto">
              <TokenRoleManager contractAddress={token.contract_address} />
            </Tab>
          )}
        </Tabs>
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                トークンをミント
              </ModalHeader>
              <ModalBody>
                <Input
                  label="ミント先アドレス"
                  placeholder="0x..."
                  value={mintAddress}
                  onValueChange={setMintAddress}
                  description="トークンを受け取るウォレットアドレス"
                />
                <Input
                  label="数量"
                  type="number"
                  placeholder="1"
                  value={mintQuantity}
                  onValueChange={setMintQuantity}
                  description="ミントするトークンの数量"
                />
                {txHash && (
                  <div className="bg-success-50 border border-success-200 rounded-lg p-3">
                    <p className="text-sm text-success-700 mb-1">ミント成功！</p>
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
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  キャンセル
                </Button>
                <Button
                  color="primary"
                  onPress={async () => {
                    if (!token?.contract_address || !mintAddress) return;
                    
                    setIsMinting(true);
                    setTxHash(null);
                    
                    try {
                      const hash = await mintTo(
                        token.contract_address,
                        mintAddress,
                        parseInt(mintQuantity) || 1
                      );
                      setTxHash(hash);
                      console.log("Token minted successfully! TxHash:", hash);
                    } catch (error: any) {
                      console.error("Mint failed:", error);
                      alert(error.message || "ミントに失敗しました");
                    } finally {
                      setIsMinting(false);
                    }
                  }}
                  isLoading={isMinting}
                  isDisabled={!mintAddress || !mintQuantity || parseInt(mintQuantity) < 1}
                >
                  ミント実行
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </main>
  );
};

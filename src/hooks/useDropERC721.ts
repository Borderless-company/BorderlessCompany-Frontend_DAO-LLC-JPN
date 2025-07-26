import { useSendTransaction, useActiveAccount } from "thirdweb/react";
import { getContract, estimateGas, readContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { client } from "@/utils/client";
import { claimTo, lazyMint, setClaimConditions, getActiveClaimCondition, getTotalClaimedSupply, nextTokenIdToMint } from "thirdweb/extensions/erc721";
import { useDropERC721Roles } from "./useDropERC721Roles";

export const useDropERC721Mint = () => {
  const { mutateAsync: sendTransaction } = useSendTransaction();
  const activeAccount = useActiveAccount();
  const { hasMinterRole } = useDropERC721Roles();

  const setupClaimConditions = async (contractAddress: string) => {
    const contract = getContract({
      client,
      chain: defineChain(Number(process.env.NEXT_PUBLIC_CHAIN_ID)),
      address: contractAddress,
    });

    try {
      // First, check how many tokens are available for claiming
      const nextTokenId = await nextTokenIdToMint({ contract });
      const totalClaimed = await getTotalClaimedSupply({ contract });
      const availableSupply = Number(nextTokenId) - Number(totalClaimed);

      console.log("Token supply status:", {
        nextTokenId: nextTokenId.toString(),
        totalClaimed: totalClaimed.toString(),
        availableSupply
      });

      if (availableSupply === 0) {
        // Need to lazy mint some tokens first
        console.log("No tokens available, lazy minting 100 tokens...");
        const lazyMintTransaction = lazyMint({
          contract,
          nfts: Array(100).fill(null).map((_, i) => ({
            name: `Token #${Number(nextTokenId) + i}`,
            description: "Borderless DAO Token",
          })),
        });

        await sendTransaction(lazyMintTransaction);
        console.log("Lazy mint completed");
      }

      // Set up claim conditions with a simpler approach
      console.log("Setting up claim conditions...");
      const claimConditionsTransaction = setClaimConditions({
        contract,
        phases: [{
          maxClaimableSupply: BigInt("1000000"),
          maxClaimablePerWallet: BigInt("1000"),
          currencyAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
          price: 0,
          startTime: new Date(),
        }],
      });

      await sendTransaction(claimConditionsTransaction);
      console.log("Claim conditions set successfully");
    } catch (error) {
      console.error("Error setting up claim conditions:", error);
      throw error;
    }
  };

  const mintTo = async (contractAddress: string, recipientAddress: string, quantity: number = 1) => {
    const contract = getContract({
      client,
      chain: defineChain(Number(process.env.NEXT_PUBLIC_CHAIN_ID)),
      address: contractAddress,
    });

    let isOwner = false;
    let hasMinter = false;

    try {
      // Check if we're the owner
      try {
        const owner = await readContract({
          contract,
          method: "function owner() view returns (address)",
          params: [],
        });
        isOwner = owner?.toLowerCase() === activeAccount?.address?.toLowerCase();
        console.log("Is owner:", isOwner, "Owner:", owner, "Active account:", activeAccount?.address);
      } catch (error) {
        console.log("Could not check owner status:", error);
      }

      // Check if we have minter role
      if (activeAccount?.address) {
        try {
          hasMinter = await hasMinterRole(contractAddress, activeAccount.address);
          console.log("Has minter role:", hasMinter);
        } catch (error) {
          console.log("Could not check minter role:", error);
        }
      }

      // Check if claim conditions exist
      let hasValidClaimConditions = false;
      try {
        const activeClaimCondition = await getActiveClaimCondition({ contract });
        hasValidClaimConditions = !!activeClaimCondition;
        console.log("Active claim condition found:", activeClaimCondition);
      } catch (error) {
        console.log("No active claim conditions:", error);
      }

      // If owner and no claim conditions, set them up
      if (isOwner && !hasValidClaimConditions) {
        console.log("Owner detected, setting up claim conditions...");
        await setupClaimConditions(contractAddress);
      }

      // Check permissions before attempting to claim
      if (!isOwner && !hasMinter) {
        throw new Error("権限不足: トークンをミントするにはオーナーまたはMINTER_ROLEが必要です。");
      }

      // Now perform the claim
      console.log(`Claiming ${quantity} tokens for ${recipientAddress}...`);
      const claimTransaction = claimTo({
        contract,
        to: recipientAddress,
        quantity: BigInt(quantity),
      });

      // Estimate gas and apply 1.5x multiplier
      let gasLimit = BigInt(500000); // Higher default for claim operations
      try {
        const gasEstimate = await estimateGas({
          transaction: claimTransaction,
          account: activeAccount,
        });
        gasLimit = (gasEstimate * BigInt(15)) / BigInt(10);
        console.log("Gas estimate:", gasEstimate.toString(), "Using:", gasLimit.toString());
      } catch (error) {
        console.warn("Gas estimation failed, using default gas limit:", error);
      }
      
      const txWithGas = { ...claimTransaction, gas: gasLimit };
      const result = await sendTransaction(txWithGas);
      console.log("Mint successful! Transaction hash:", result.transactionHash);
      return result.transactionHash;

    } catch (error: any) {
      console.error("Mint error details:", error);
      
      // Provide helpful error messages based on common DropERC721 errors
      const errorMessage = error.message || error.toString();
      
      if (errorMessage.includes("AccessControl") || errorMessage.includes("権限不足")) {
        throw new Error("権限エラー: この操作を実行する権限がありません。管理者にMINTER_ROLEの付与を依頼してください。");
      } else if (errorMessage.includes("!Tokens") || errorMessage.includes("ETokens")) {
        if (isOwner || hasMinter) {
          throw new Error("トークンの供給が不足しています。追加のトークンをレイジーミントしてください。");
        } else {
          throw new Error("クレーム条件が設定されていないか、トークンの供給が不足しています。管理者にお問い合わせください。");
        }
      } else if (errorMessage.includes("!MaxSupply")) {
        throw new Error("最大供給量に達しました。これ以上のトークンはミントできません。");
      } else if (errorMessage.includes("!Qty")) {
        throw new Error("指定された数量が許可された最大数を超えています。");
      } else if (errorMessage.includes("!PriceOrCurrency")) {
        throw new Error("価格または通貨の設定に問題があります。");
      } else if (errorMessage.includes("!Time")) {
        throw new Error("クレーム期間外です。");
      }
      
      throw error;
    }
  };

  return { mintTo, setupClaimConditions };
};
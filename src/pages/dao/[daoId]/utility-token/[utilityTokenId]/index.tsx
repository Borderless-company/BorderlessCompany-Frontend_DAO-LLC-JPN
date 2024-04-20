"use client";
import type { NextPage } from "next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useRouter } from "next/router";
import ListUtilityTokenHolders from "@/components/web3/UtilityToken/ListUtilityTokenHolders";
import ListUtilityTokenHistory from "@/components/web3/UtilityToken/ListUtilityTokenHistory";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Link,
  Image,
} from "@nextui-org/react";

import { UtilityTokenTotalSupply } from "@/components/web3/UtilityToken/UtilityTokenTotalSupply";
import { Address } from "viem";
import { UtilityTokenDecimals } from "@/components/web3/UtilityToken/UtilityTokenDecimals";
import { UtilityTokenName } from "@/components/web3/UtilityToken/UtilityTokenName";
import { UtilityTokenSymbol } from "@/components/web3/UtilityToken/UtilityTokenSymbol";
import { BlockExplorerUrl, getBlockExplorerUrl } from "@/utils/contractAddress";
import { useEffect, useState } from "react";
import { useChainId } from "wagmi";

const UtilityTokenDetail: NextPage = () => {
  const chainId = useChainId();
  const { daoId, utilityTokenId } = useRouter().query;
  const [blockExplorerUrl, setBlockExplorerUrl] = useState<string>();
  useEffect(() => {
    setBlockExplorerUrl(getBlockExplorerUrl(chainId));
  }, [chainId]);

  return (
    <DashboardLayout>
      <div className="h-full lg:px-6">
        <div className="flex flex-col justify-center w-full py-5 px-4 lg:px-0  max-w-[90rem] mx-auto gap-3">
          <div>
            <Card className="max-w-[400px]">
              <CardHeader className="flex gap-3">
                {/* <Image
                  alt="Token Image"
                  height={40}
                  radius="sm"
                  src="https://avatars.githubusercontent.com/u/86160567?s=200&v=4"
                  width={40}
                /> */}
                <div className="flex flex-col">
                  <p className="text-md">
                    <UtilityTokenName
                      contractAddress={utilityTokenId as Address}
                    />
                  </p>
                  <p className="text-small text-default-500">
                    <UtilityTokenSymbol
                      contractAddress={utilityTokenId as Address}
                    />
                  </p>
                </div>
              </CardHeader>
              <Divider />
              <CardBody>
                <div className="flex flex-col gap-2">
                  <div>
                    <p className="text-sm font-semibold">総発行数</p>
                    <p className="text-sm">
                      <UtilityTokenTotalSupply
                        contractAddress={utilityTokenId as Address}
                      />{" "}
                      <span>
                        <UtilityTokenSymbol
                          contractAddress={utilityTokenId as Address}
                        />
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">桁数</p>
                    <p className="text-sm">
                      <UtilityTokenDecimals
                        contractAddress={utilityTokenId as Address}
                      />
                    </p>
                  </div>
                </div>
              </CardBody>
              <Divider />
              <CardFooter>
                <Link
                  isExternal
                  showAnchorIcon
                  href={`${blockExplorerUrl}/address/${utilityTokenId}`}
                  className="text-xs"
                >
                  {utilityTokenId}
                </Link>
              </CardFooter>
            </Card>
          </div>
          <div className="flex  flex-wrap justify-between">
            <h3 className="text-center text-xl font-semibold">所有者一覧</h3>
          </div>
          <div className="w-full flex flex-col gap-4">
            <ListUtilityTokenHolders />
          </div>

          <div className="flex  flex-wrap justify-between">
            <h3 className="text-center text-xl font-semibold">移動履歴</h3>
          </div>
          <div className="w-full flex flex-col gap-4">
            <ListUtilityTokenHistory />
          </div>

          <div>
            <Button
              color="primary"
              as={Link}
              href={`/dao/${daoId}/utility-token/${utilityTokenId}/mint`}
            >
              トークンを発行する
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UtilityTokenDetail;

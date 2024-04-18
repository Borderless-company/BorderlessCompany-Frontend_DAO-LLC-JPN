import React, { useState, useEffect, useCallback } from "react";
import { Address } from "viem";
import { useAccount, useChainId, usePublicClient } from "wagmi";
import { CompanyCard } from "@/components/CompanyCard";
import router from "next/router";
import {
  getRegisterBorderlessCompanyContractAddress,
  getStartBlockNumber,
} from "@/utils/contractAddress";

const ListCompanies = () => {
  const chainId = useChainId();
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [companies, setCompanies] = useState<any[]>([]);
  const [contractAddress, setContractAddress] = useState<Address>();
  const [startBlockNumber, setStartBlockNumber] = useState<number>();

  useEffect(() => {
    setContractAddress(getRegisterBorderlessCompanyContractAddress(chainId));
    setStartBlockNumber(getStartBlockNumber(chainId));
  }, [chainId]);

  const fetchLogs = useCallback(async () => {
    if (!publicClient) return;
    const logs = await publicClient.getLogs({
      address: contractAddress,
      event: {
        type: "event",
        name: "NewBorderlessCompany",
        inputs: [
          {
            name: "founder_",
            type: "address",
            indexed: true,
            internalType: "address",
          },
          {
            name: "company_",
            type: "address",
            indexed: true,
            internalType: "address",
          },
          {
            name: "companyIndex_",
            type: "uint256",
            indexed: true,
            internalType: "uint256",
          },
        ],
      },
      fromBlock: startBlockNumber ? BigInt(startBlockNumber) : undefined,
      toBlock: "latest",
    });
    const companies = logs.map((log) => ({
      founder: log.args.founder_,
      company: log.args.company_,
      companyIndex: Number(log.args.companyIndex_),
    }));
    setCompanies(companies);
    console.log(logs);
  }, [contractAddress, publicClient, startBlockNumber]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <ul
      role="list"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3"
    >
      {companies.map((company, index) => (
        <li
          key={index}
          className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow cursor-pointer"
          onClick={() => {
            router.push(`/dao/${company.company}`);
          }}
        >
          <CompanyCard company={company} />
        </li>
      ))}
    </ul>
  );
};

export default ListCompanies;

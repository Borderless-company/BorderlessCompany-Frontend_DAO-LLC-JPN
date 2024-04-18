export const RegisterBorderlessCompanyAbi = [
  {
    type: "constructor",
    inputs: [{ name: "whitelist_", type: "address", internalType: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "createBorderlessCompany",
    inputs: [
      { name: "companyID_", type: "bytes", internalType: "bytes" },
      {
        name: "establishmentDate_",
        type: "bytes",
        internalType: "bytes",
      },
      { name: "confirmed_", type: "bool", internalType: "bool" },
    ],
    outputs: [
      { name: "started_", type: "bool", internalType: "bool" },
      {
        name: "companyAddress_",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
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
    anonymous: false,
  },
  {
    type: "error",
    name: "DoNotCreateBorderlessCompany",
    inputs: [{ name: "account_", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "InvalidCompanyInfo",
    inputs: [{ name: "account_", type: "address", internalType: "address" }],
  },
] as const;

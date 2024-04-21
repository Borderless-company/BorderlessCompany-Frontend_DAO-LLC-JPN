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
    type: "function",
    name: "setFactoryPool",
    inputs: [
      { name: "factoryPool_", type: "address", internalType: "address" },
    ],
    outputs: [],
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
    type: "event",
    name: "SetFactoryPool",
    inputs: [
      {
        name: "account_",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "pool_",
        type: "address",
        indexed: true,
        internalType: "address",
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
  {
    type: "error",
    name: "InvalidParam",
    inputs: [{ name: "account_", type: "address", internalType: "address" }],
  },
] as const;

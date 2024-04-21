export const TokenServiceAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "admin_", type: "address", internalType: "address" },
      { name: "company_", type: "address", internalType: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "activateStandard721Token",
    inputs: [
      { name: "name_", type: "string", internalType: "string" },
      { name: "symbol_", type: "string", internalType: "string" },
      { name: "baseURI_", type: "string", internalType: "string" },
      { name: "sbt_", type: "bool", internalType: "bool" },
    ],
    outputs: [{ name: "success_", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getInfoStandard721token",
    inputs: [{ name: "index_", type: "uint256", internalType: "uint256" }],
    outputs: [
      { name: "token_", type: "address", internalType: "address" },
      { name: "name_", type: "string", internalType: "string" },
      { name: "symbol_", type: "string", internalType: "string" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getLastIndexStandard721Token",
    inputs: [],
    outputs: [{ name: "index_", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "NewNonFungibleToken721",
    inputs: [
      {
        name: "token_",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "symbol_",
        type: "string",
        indexed: true,
        internalType: "string",
      },
      {
        name: "name_",
        type: "string",
        indexed: false,
        internalType: "string",
      },
      {
        name: "sbt_",
        type: "bool",
        indexed: false,
        internalType: "bool",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "InvalidIndex",
    inputs: [{ name: "index_", type: "uint256", internalType: "uint256" }],
  },
  {
    type: "error",
    name: "InvalidParam",
    inputs: [
      { name: "account", type: "address", internalType: "address" },
      { name: "name_", type: "string", internalType: "string" },
      { name: "symbol_", type: "string", internalType: "string" },
      { name: "baseURI_", type: "string", internalType: "string" },
    ],
  },
] as const;

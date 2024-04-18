export const WhitelistAbi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
  {
    type: "function",
    name: "addToWhitelist",
    inputs: [{ name: "account_", type: "address", internalType: "address" }],
    outputs: [{ name: "listed_", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "isWhitelisted",
    inputs: [{ name: "account_", type: "address", internalType: "address" }],
    outputs: [{ name: "listed_", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "NewReserver",
    inputs: [
      {
        name: "caller_",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "account_",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "DoNotToAddWhitelist",
    inputs: [{ name: "account_", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "InvalidAddress",
    inputs: [{ name: "account_", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "ReserverAlready",
    inputs: [{ name: "account_", type: "address", internalType: "address" }],
  },
] as const;

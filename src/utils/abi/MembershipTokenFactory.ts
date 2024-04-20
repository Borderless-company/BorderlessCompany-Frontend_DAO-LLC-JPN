export const MembershipTokenFactoryAbi = [
  {
    type: "function",
    name: "createMembershipToken",
    inputs: [
      {
        name: "name_",
        type: "string",
        internalType: "string",
      },
      {
        name: "symbol_",
        type: "string",
        internalType: "string",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "TokenCreated",
    inputs: [
      {
        name: "tokenAddress_",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "name_",
        type: "string",
        indexed: false,
        internalType: "string",
      },
      {
        name: "symbol_",
        type: "string",
        indexed: false,
        internalType: "string",
      },
    ],
    anonymous: false,
  },
] as const;

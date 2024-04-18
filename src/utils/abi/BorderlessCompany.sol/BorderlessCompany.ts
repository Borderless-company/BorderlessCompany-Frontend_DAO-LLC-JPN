export const BorderlessCompanyAbi = [
  {
    type: "constructor",
    inputs: [{ name: "admin_", type: "address", internalType: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "callAdmin",
    inputs: [],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
] as const;

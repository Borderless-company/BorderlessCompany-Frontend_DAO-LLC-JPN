export const BorderlessCompanyAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "admin_", type: "address", internalType: "address" },
      { name: "register_", type: "address", internalType: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "assignmentRole",
    inputs: [
      { name: "account_", type: "address", internalType: "address" },
      { name: "isAdmin_", type: "bool", internalType: "bool" },
    ],
    outputs: [{ name: "assigned_", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getService",
    inputs: [{ name: "index_", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "service_", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "initialService",
    inputs: [
      {
        name: "services_",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    outputs: [{ name: "completed_", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "releaseRole",
    inputs: [
      { name: "account_", type: "address", internalType: "address" },
      { name: "isAdmin_", type: "bool", internalType: "bool" },
    ],
    outputs: [{ name: "released_", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "AssignmentRoleAdmin",
    inputs: [
      {
        name: "admin_",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "assigned_",
        type: "bool",
        indexed: false,
        internalType: "bool",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "AssignmentRoleMember",
    inputs: [
      {
        name: "member_",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "assigned_",
        type: "bool",
        indexed: false,
        internalType: "bool",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "InitialService",
    inputs: [
      {
        name: "company_",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "governance_",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "treasury_",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "token_",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ReleaseRoleAdmin",
    inputs: [
      {
        name: "admin_",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "released_",
        type: "bool",
        indexed: false,
        internalType: "bool",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ReleaseRoleMember",
    inputs: [
      {
        name: "member_",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "released_",
        type: "bool",
        indexed: false,
        internalType: "bool",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "AlreadyAssignmentRole",
    inputs: [{ name: "account_", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "AlreadyInitialService",
    inputs: [{ name: "account_", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "AlreadyReleaseRole",
    inputs: [{ name: "account_", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "InvalidAddress",
    inputs: [{ name: "account_", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "InvalidIndex",
    inputs: [{ name: "index_", type: "uint256", internalType: "uint256" }],
  },
] as const;

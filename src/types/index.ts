export type Token = {
  id: string;
  name: string;
  symbol: string;
  isExecutable: boolean;
  image?: string;
  description?: string;
  minPrice?: number; // YEN
  maxPrice?: number;
  fixedPrice?: number;
  productID?: string;
};

export type TermSheet = {
  id: string;
  name: string;
  url: string;
};

export type Estuary = {
  id: string;
  orgName: string;
  orgLogo: string;
  isPublic: boolean;
  token: Token[];
  startDate: Date;
  endDate: Date;
  softCap?: number;
  termSheet: TermSheet[];
  paymentMethod: string[];
  estuaryLink: string;
  primaryColor?: string;
};

export const estuarySample: Estuary = {
  id: "1234-abcd-5678",
  orgName: "KABA DAO LLC",
  orgLogo: "/estuary_logo_sample.png",
  isPublic: true,
  token: [
    // {
    //   id: "1234-abcd-5678",
    //   name: "DYNAMOトークン",
    //   isExecutive: true,
    //   image: "https://estuary.xyz/logo.png",
    //   symbol: "DYNAMO",
    //   description: "DYNAMOトークンはカバDAOの業務執行社員トークンです。",
    //   minPrice: 10000,
    //   maxPrice: 29999,
    // },
    {
      id: "1",
      name: "KABAトークン",
      isExecutable: false,
      image: "/estuary_logo_sample.png",
      symbol: "KABA",
      description: "KABAトークンはカバDAOの非業務執行社員トークンです。",
      // minPrice: 10000,
      // maxPrice: 29999,
      fixedPrice: 30000,
    },
    // {
    //   id: "2",
    //   name: "KABAトークン",
    //   isExecutive: false,
    //   image: "/estuary_token_sample2.webp",
    //   symbol: "KABA",
    //   description: "KABAトークンはカバDAOの非業務執行社員トークンです。",
    //   minPrice: 30000,
    //   maxPrice: 99999,
    // },
    // {
    //   id: "3",
    //   name: "KABAトークン",
    //   isExecutive: false,
    //   image: "/estuary_token_sample3.webp",
    //   symbol: "KABA",
    //   description: "KABAトークンはカバDAOの非業務執行社員トークンです。",
    //   minPrice: 100000,
    //   maxPrice: Infinity,
    // },
  ],
  startDate: new Date("2024-10-01"),
  endDate: new Date("2024-10-31"),
  softCap: undefined,
  termSheet: [
    { id: "AoI", name: "定款", url: "https://estuary.xyz/AoI.pdf" },
    {
      id: "governanceAgreement",
      name: "総会規定",
      url: "https://estuary.xyz/GovernanceAgreement.pdf",
    },
    {
      id: "tokenAgreement",
      name: "トークン規定",
      url: "https://estuary.xyz/TokenAgreement.pdf",
    },
    {
      id: "operationAgreement",
      name: "運営規定",
      url: "https://estuary.xyz/OperationAgreement.pdf",
    },
  ],
  paymentMethod: ["crypto", "fiat"],
  estuaryLink: "https://estuary.xyz",
};

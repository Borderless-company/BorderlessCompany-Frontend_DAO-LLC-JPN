export type Token = {
  id: string;
  name: string;
  symbol: string;
  isExecutive: boolean;
  image?: string;
  description?: string;
  minPrice?: number; // YEN
  maxPrice?: number;
  fixedPrice?: number;
};

export type TermSheet = {
  AoI: string;
  tokenAgreement: string;
  governanceAgreement: string;
  operationAgreement: string;
  [key: string]: string | undefined;
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
};

export const estuarySample: Estuary = {
  id: "1234-abcd-5678",
  orgName: "カバDAO",
  orgLogo: "https://estuary.xyz/logo.png",
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
      id: "1234-abcd-5678",
      name: "KABAトークン",
      isExecutive: false,
      image: "https://estuary.xyz/logo.png",
      symbol: "KABA",
      description: "KABAトークンはカバDAOの非業務執行社員トークンです。",
      minPrice: 10000,
      maxPrice: 29999,
    },
    {
      id: "1234-abcd-5678",
      name: "KABAトークン",
      isExecutive: false,
      image: "https://estuary.xyz/logo.png",
      symbol: "KABA",
      description: "KABAトークンはカバDAOの非業務執行社員トークンです。",
      minPrice: 30000,
      maxPrice: 99999,
    },
    {
      id: "1234-abcd-5678",
      name: "KABAトークン",
      isExecutive: false,
      image: "https://estuary.xyz/logo.png",
      symbol: "KABA",
      description: "KABAトークンはカバDAOの非業務執行社員トークンです。",
      minPrice: 100000,
      maxPrice: Infinity,
    },
  ],
  startDate: new Date("2024-10-01"),
  endDate: new Date("2024-10-31"),
  softCap: undefined,
  termSheet: [
    {
      AoI: "https://estuary.xyz/AoI.pdf ",
      tokenAgreement: "https://estuary.xyz/tokenAgreement.pdf",
      governanceAgreement: "https://estuary.xyz/governanceAgreement.pdf",
      operationAgreement: "https://estuary.xyz/operationAgreement.pdf",
    },
  ],
  paymentMethod: ["crypto", "fiat"],
  estuaryLink: "https://estuary.xyz",
};

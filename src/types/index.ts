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
  orgLogo:
    "https://media.discordapp.net/attachments/1225737568218251306/1284194872135520296/IMG_20240914_015149_365.jpg?ex=66e5bf2c&is=66e46dac&hm=ad29fd0e008de2f3df3322ea4eab6e08a02444c7d8c56c9090d6629a94392b38&=&format=webp&width=2298&height=1638",
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
      isExecutive: false,
      image: "/estuary_token_sample1.webp",
      symbol: "KABA",
      description: "KABAトークンはカバDAOの非業務執行社員トークンです。",
      minPrice: 10000,
      maxPrice: 29999,
    },
    {
      id: "2",
      name: "KABAトークン",
      isExecutive: false,
      image: "/estuary_token_sample2.webp",
      symbol: "KABA",
      description: "KABAトークンはカバDAOの非業務執行社員トークンです。",
      minPrice: 30000,
      maxPrice: 99999,
    },
    {
      id: "3",
      name: "KABAトークン",
      isExecutive: false,
      image: "/estuary_token_sample3.webp",
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

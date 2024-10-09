// MARK: USER
export type User = {
  evmAddress?: string;
  name?: string;
  furigana?: string;
  address?: string;
  kycStatus?: string;
  paymentLink?: string;
  paymentStatus?: string;
  price?: string;
  dateOfEmployment?: string;
};

// MARK: Token
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
  productId?: string;
};

export type TermSheet = {
  id: string;
  name: string;
  url: string;
};

// MARK: Estuary
export type Estuary = {
  id: string;
  orgName: string;
  orgLogo: string;
  isPublic: boolean;
  tokens: Token[];
  startDate: Date;
  endDate: Date;
  softCap?: number;
  termSheet: TermSheet[];
  paymentMethod: string[];
  estuaryLink: string;
  primaryColor?: string;
};

// MARK: Sample
export const estuarySample: Estuary = {
  id: "1234-abcd-5678",
  orgName: "KABA DAO LLC",
  orgLogo: "/estuary_logo_sample.png",
  isPublic: true,
  tokens: [
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
    { id: "AoI", name: "定款", url: "https://drive.google.com/file/d/16YChRF9EE44oH8trxtS50FVpc8o7Dj1e/view?usp=drive_web" },
    {
      id: "governanceAgreement",
      name: "総会規定",
      url: "hhttps://drive.google.com/file/d/1qN8YtwOrS6X7D_2yyqJqdTjz7ia7okB0/view?usp=drive_web",
    },
    {
      id: "tokenAgreement",
      name: "トークン規定",
      url: "https://estuary.xyz/TokenAgreement.pdf",
    },
    {
      id: "operationAgreement",
      name: "運営規定",
      url: "https://drive.google.com/file/d/1t3iXlub1YkHNbxUyLxAH3-oCmaSi7_ZR/view?usp=drive_web",
    },
  ],
  paymentMethod: ["crypto", "fiat"],
  estuaryLink: "https://estuary.xyz",
};

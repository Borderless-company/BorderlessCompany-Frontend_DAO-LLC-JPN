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
      image:
        "https://media.discordapp.net/attachments/1225737568218251306/1284195122078023734/IMG_20240914_015249_275.jpg?ex=66e5bf68&is=66e46de8&hm=361715dcdec2a1e412db19929430778e6c7f25534c9c2727919daadaa3c45ef4&=&format=webp&width=1228&height=1638",
      symbol: "KABA",
      description: "KABAトークンはカバDAOの非業務執行社員トークンです。",
      minPrice: 10000,
      maxPrice: 29999,
    },
    {
      id: "2",
      name: "KABAトークン",
      isExecutive: false,
      image:
        "https://media.discordapp.net/attachments/1225737568218251306/1284195325027815464/IMG_20240914_015339_717.jpg?ex=66e5bf98&is=66e46e18&hm=3203a4e796362ee4983b64cff06e078d6293acdd94cb760f2e01f648511cc399&=&format=webp&width=1228&height=1638",
      symbol: "KABA",
      description: "KABAトークンはカバDAOの非業務執行社員トークンです。",
      minPrice: 30000,
      maxPrice: 99999,
    },
    {
      id: "3",
      name: "KABAトークン",
      isExecutive: false,
      image:
        "https://media.discordapp.net/attachments/1225737568218251306/1284195762468552784/D770E3C6-9098-45D0-B9E8-E998AD8E4270.jpg?ex=66e5c000&is=66e46e80&hm=3048f4983b87c09b82e1f064adc1a6004719e53c1441351dadf1d41912212471&=&format=webp&width=526&height=700",
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

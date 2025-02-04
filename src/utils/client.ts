import { ACCOUNT_FACTORY_ADDRESS } from "@/constants";
import { createThirdwebClient, getContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";

export const defaultChain = defineChain(Number(process.env.NEXT_PUBLIC_CHAIN_ID));

// create the client with your clientId, or secretKey if in a server environment
export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "",
});

// connect to your contract
export const accountFactoryContract = getContract({
  client,
  chain: defaultChain,
  address: ACCOUNT_FACTORY_ADDRESS,
});

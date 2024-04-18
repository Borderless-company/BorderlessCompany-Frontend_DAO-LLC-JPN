import { MetaMaskIcon } from "./MetamaskIcon";
import { TrustWalletIcon } from "./TrustWalletIcon";
import { WalletConnectIcon } from "./WalletConnectIcon";
import { WalletDefaultIcon } from "./WalletDefaultIcon";
import { Web3AuthIcon } from "./Web3AuthIcon";

export const WalletIcon = ({ connector }: { connector: string }) => {
  let icon;
  switch (connector) {
    case "Web3Auth":
      icon = <Web3AuthIcon />;
      break;
    case "WalletConnect":
      icon = <WalletConnectIcon />;
      break;
    case "MetaMask":
      icon = <MetaMaskIcon />;
      break;
    case "Trust Wallet":
      icon = <TrustWalletIcon />;
      break;
    default:
      icon = <WalletDefaultIcon />;
  }

  return <>{icon}</>;
};

import { FC, useMemo } from "react";
import { Button, ButtonProps } from "@nextui-org/react";
import {
  SocialProfile,
  useActiveAccount,
  useSocialProfiles,
  useWalletDetailsModal,
} from "thirdweb/react";
import { client } from "@/utils/client";
type AccountPlateProps = {} & ButtonProps;

export const AccountPlate: FC<AccountPlateProps> = ({ ...props }) => {
  const account = useActiveAccount();
  const { data: socialProfiles } = useSocialProfiles({
    client,
    address: account?.address || undefined,
  });
  const walletDetail = useWalletDetailsModal();

  return (
    <Button
      className="justify-start bg-content1 h-14 border-1 border-divider px-4 hover:bg-content2 shadow-sm"
      onPress={() => walletDetail.open({ client, theme: "light" })}
      {...props}
    >
      <WalletAvatar socialProfiles={socialProfiles} />
      {`${account?.address?.slice(0, 6)}...${account?.address?.slice(-4)}`}
    </Button>
  );
};

const WalletAvatar: FC<{ socialProfiles?: SocialProfile[] }> = ({
  socialProfiles,
}) => {
  const profileWithAvatar = useMemo(() => {
    if (!socialProfiles) return undefined;
    return socialProfiles?.find((profile) => profile?.avatar);
  }, [socialProfiles]);

  return profileWithAvatar?.avatar ? (
    <img src={profileWithAvatar.avatar} className="w-6 h-6 rounded-full" />
  ) : (
    <div className="w-6 h-6 rounded-full bg-purple-900"></div>
  );
};

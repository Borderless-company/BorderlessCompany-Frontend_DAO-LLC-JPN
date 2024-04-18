import SimpleLayout from "@/components/layout/SimpleLayout";
import WalletLogin from "@/components/wallet/WalletLogin";
import { CurrentAddressCallAdmin } from "@/components/web3/BorderlessCompany/CurrentAddressCallAdmin";
import { CreateBorderlessCompany } from "@/components/web3/RegisterBorderlessCompany/CreateBorderlessCompany";
import ListCompanies from "@/components/web3/RegisterBorderlessCompany/ListCompanies";
import { CurrentAddressIsWhitelisted } from "@/components/web3/Whitelist/CurrentAddressIsWhitelisted";
import { FormIsWhitelisted } from "@/components/web3/Whitelist/FormIsWhitelisted";
import { IsWhitelisted } from "@/components/web3/Whitelist/IsWhitelisted";
import { Button } from "@nextui-org/react";
import router from "next/router";

export default function Home() {
  return (
    <SimpleLayout>
      <CurrentAddressIsWhitelisted />
      <CreateBorderlessCompany />

      <div>
        <Button
          onPress={() => {
            router.push("/dao");
          }}
        >
          DAO一覧を見る
        </Button>
      </div>
    </SimpleLayout>
  );
}

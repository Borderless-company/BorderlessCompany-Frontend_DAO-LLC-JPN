import SimpleLayout from "@/components/layout/SimpleLayout";
import ListCompanies from "@/components/web3/RegisterBorderlessCompany/ListCompanies";
import { withAuthGSSP } from "@/utils/isLogin";


export default function DaoIndex() {
  return (
    <SimpleLayout>
      <div className="text-2xl font-bold">DAO一覧</div>
      <ListCompanies />
    </SimpleLayout>
  );
}

import { Card, CardHeader, CardBody, Image } from "@heroui/react";
import { supabase } from "@/utils/supabase";
import { useEffect } from "react";
interface Company {
  founder: string;
  company: string;
  companyIndex: string;
}

export const CompanyCard = ({ company }: { company: Company }) => {
  return (
    <Card className="py-4">
      <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
        <p className="text-tiny uppercase font-bold">{company.companyIndex}</p>
        <small className="text-default-500">{company.founder}</small>
        <h4 className="font-bold text-large">{company.company}</h4>
      </CardHeader>
      <CardBody className="overflow-visible py-2">
        <Image
          alt="Card background"
          className="object-cover rounded-xl"
          src="https://via.placeholder.com/500x500"
          width={270}
          height={270}
        />
      </CardBody>
    </Card>
  );
};

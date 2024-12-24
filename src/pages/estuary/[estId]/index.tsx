import { NextPage } from "next";
import { EstuaryContainer } from "../../../components/estuary/EstuaryContainer";
import { ThirdwebProvider } from "thirdweb/react";
import { EstuaryProvider } from "@/components/estuary/EstuaryContext";
import { useParams } from "next/navigation";


const Estuary = () => {
  return (
    <ThirdwebProvider>
      <EstuaryProvider>
        <EstuaryContainer />
      </EstuaryProvider>
    </ThirdwebProvider>
  );
};

export default Estuary;

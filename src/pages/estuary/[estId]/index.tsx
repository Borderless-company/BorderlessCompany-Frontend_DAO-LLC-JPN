import { NextPage } from "next";
import { EstuaryContainer } from "../_components/EstuaryContainer";
import { ThirdwebProvider } from "thirdweb/react";

type EstuaryProps = {
  logoSrc: string;
  orgName: string;
  // tokens: Token[];
};

const Estuary: NextPage<EstuaryProps> = () => {
  // const { estId } = useParams<{ estId: string }>();
  return (
    <ThirdwebProvider>
      <EstuaryContainer />
    </ThirdwebProvider>
  );
};

export default Estuary;

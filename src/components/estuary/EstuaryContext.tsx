import { Token } from "@/types";
import { useQueries } from "@tanstack/react-query";
import {
  FC,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useState,
  Dispatch,
} from "react";
import { supabase } from "@/utils/supabase";

export type EstuaryContextType = {
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  tokenId?: string;
  setTokenId: Dispatch<SetStateAction<string | undefined>>;
  price?: number;
  setPrice: Dispatch<SetStateAction<number | undefined>>;
  token?: Token;
  setToken: Dispatch<SetStateAction<Token | undefined>>;
};

const EstuaryContext = createContext<EstuaryContextType>({
  page: 0,
  setPage: () => {},
  tokenId: undefined,
  setTokenId: () => {},
  price: undefined,
  setPrice: () => {},
  token: undefined,
  setToken: () => {},
});

export const useEstuaryContext = () => {
  const context = useContext(EstuaryContext);
  if (!context) {
    throw new Error("useEstuary must be used within a EstuaryProvider");
  }

  return { ...context };
};

export const EstuaryProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [page, setPage] = useState(0);
  const [tokenId, setTokenId] = useState<string | undefined>();
  const [price, setPrice] = useState<number | undefined>();
  const [token, setToken] = useState<Token | undefined>();
  return (
    <EstuaryContext.Provider
      value={{
        page,
        setPage,
        tokenId,
        setTokenId,
        price,
        setPrice,
        token,
        setToken,
      }}
    >
      {children}
    </EstuaryContext.Provider>
  );
};

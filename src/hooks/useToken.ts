import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase, camelizeDeeply } from "@/utils/supabase";
import { Token } from "@/types";
import stripe from "@/utils/stripe";

export type CreateTokenProps = Partial<Token> & { name: string };

export type UseTokenProps = {
  id?: string;
};

const _createProduct = async (name: string, image?: string) => {
  const product = await stripe.products.create({
    name: name,
    images: image ? [image] : [],
  });
  return product;
};

export const useToken = (id?: string) => {
  const queryClient = useQueryClient();
  const { mutateAsync: createToken } = useMutation<
    Token,
    Error,
    CreateTokenProps
  >({
    mutationFn: async (props: CreateTokenProps) => {
      const product = await _createProduct(props.name!, props.image);
      const { data, error } = await supabase
        .from("TOKEN")
        .insert({
          id: props.id,
          name: props.name,
          symbol: props.symbol,
          is_executable: props.isExecutable,
          image: props.image,
          description: props.description,
          min_price: props.minPrice,
          max_price: props.maxPrice,
          fixed_price: props.fixedPrice,
          product_id: product.id,
        })
        .select();
      if (error) {
        throw new Error(error.message);
      }
      console.log("[SUCCESS] Token created: ", data);
      return data[0];
    },
    onError: (error) => {
      console.error("[ERROR] Failed to create token: ", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
    },
  });

  const { data: tokenData } = useQuery<any, Error>({
    queryKey: ["token", id],
    queryFn: async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("TOKEN")
        .select()
        .eq("id", id)
        .single();
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });

  const token = camelizeDeeply(tokenData) as Token;
  return { createToken, token };
};

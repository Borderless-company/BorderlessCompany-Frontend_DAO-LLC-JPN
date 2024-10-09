import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase, camelizeDeeply } from "@/utils/supabase";
import { Token } from "@/types";
import stripe from "@/utils/stripe";
import { Tables } from "@/types/schema";

export type CreateTokenProps = Partial<Tables<"TOKEN">> & { name: string };

export type UseTokenProps = {
  id?: string;
};

export const createProduct = async (name: string, image?: string) => {
  const product = await stripe.products.create({
    name: name,
    images: image ? [image] : [],
  });
  console.log("product_id", product)
  return product;
};

export const useToken = (id?: string) => {
  const queryClient = useQueryClient();
  const { mutateAsync: createToken } = useMutation<
    Tables<"TOKEN">,
    Error,
    CreateTokenProps
  >({
    mutationFn: async (props: CreateTokenProps) => {
      // const product = await createProduct(
      //   props.name!,
      //   props.image ? props.image : undefined
      // );
      const { data, error } = await supabase
        .from("TOKEN")
        .insert({
          id: props.id,
          name: props.name,
          symbol: props.symbol,
          is_executable: props.is_executable,
          image: props.image,
          min_price: props.min_price,
          max_price: props.max_price,
          fixed_price: props.fixed_price,
          // product_id: product.id,
          dao_id: props.dao_id
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

  const { mutateAsync: updateToken } = useMutation<
    Tables<"TOKEN">,
    Error,
    Partial<Tables<"TOKEN">>
  >({
    mutationFn: async (props: Partial<Tables<"TOKEN">>) => {
      if (!props.id) {
        throw new Error("Token ID is required for update");
      }
      const { data, error } = await supabase
        .from("TOKEN")
        .update(props)
        .eq("id", props.id)
        .select();
      if (error) {
        throw new Error(error.message);
      }
      console.log("[SUCCESS] Token updated: ", data);
      return data[0];
    },
    onError: (error) => {
      console.error("[ERROR] Failed to update token: ", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
    },
  });

  const { data: token } = useQuery<Tables<"TOKEN"> | undefined, Error>({
    queryKey: ["token", id],
    queryFn: async () => {
      if (!id) return undefined;
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

  return { createToken, updateToken, token: token };
};

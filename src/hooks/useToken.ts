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

      const response = await fetch('/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(props),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error);
      }
      console.log("[SUCCESS] Token created: ", json.data);
      return json.data;
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

      const response = await fetch('/api/token', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(props),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error);
      }
      console.log("[SUCCESS] Token updated: ", json.data);
      return json.data;
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

  return { createToken, updateToken, token };
};

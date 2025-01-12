import { supabase } from "../supabase";

export const hasAccount = async (address: string) => {
  const { data, error } = await supabase
    .from("USER")
    .select()
    .eq("evm_address", address);
  if (error) {
    console.error("hasAccount error: ", error);
    throw new Error(error.message);
  }
  if (data.length === 0) {
    return false;
  }
  return true;
};

import { Database } from "@/types/schema";
import { createClient } from "@supabase/supabase-js";
import camelcaseKeys from "camelcase-keys";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl!, supabaseKey!);
export const camelizeDeeply = <T extends Record<string, any> | readonly any[]>(
  arg: T
) => camelcaseKeys(arg, { deep: true });

import { Database } from "@/types/schema";
import { createClient } from "@supabase/supabase-js";
import camelcaseKeys from "camelcase-keys";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl!, supabaseKey!);
export const camelizeDeeply = <T extends Record<string, any> | readonly any[]>(
  arg: T
) => camelcaseKeys(arg, { deep: true });

export const uploadFile = async (bucket: string, filePath: string, file: File) => {

  console.log("filePath: ", filePath)
  console.log("File: ", file)
  const { data, error} = await supabase.storage
        .from(bucket)
        .upload(filePath, file)

  const publicData = supabase.storage.from(bucket).getPublicUrl(filePath)
  console.log("data:", data)
  console.log("publicUrl:", publicData)
  console.log("upload error:", error)
  return { data, publicUrl: publicData.data.publicUrl, error }
}
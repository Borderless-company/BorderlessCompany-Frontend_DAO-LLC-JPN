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

  const base64 = await fileToBase64(file);

  const response = await fetch('/api/uploadfile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ bucket, filePath, base64 }),
  });

  const { data, publicUrl, error } = await response.json();
  
  console.log("data:", data);
  console.log("publicUrl:", publicUrl);
  console.log("upload error:", error);

  return { data, publicUrl, error };
}

// FileをBase64文字列に変換するヘルパー関数
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        // "data:xxx;base64," を除去し純粋なbase64を抽出
        const base64Data = result.split(',')[1] || '';
        resolve(base64Data);
      } else {
        reject('Failed to convert file to base64');
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
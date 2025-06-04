import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/schema";

const serviveRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabase = createClient<Database>(supabaseUrl!, serviveRoleKey!);

type Data = {
  data?: any;
  publicUrl?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { bucket, filePath, base64, contentType } = req.body;

  if (!bucket || !filePath || !base64) {
    return res
      .status(400)
      .json({ error: "bucket, filePath, and base64 are required." });
  }

  try {
    const fileBuffer = Buffer.from(base64, "base64");

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        contentType: contentType || "image/png",
        upsert: true,
      });

    if (error) {
      console.log("upload error:", error);
      return res.status(500).json({ error: error.message });
    }

    const publicData = supabase.storage.from(bucket).getPublicUrl(filePath);

    return res.status(200).json({ data, publicUrl: publicData.data.publicUrl });
  } catch (err: any) {
    console.error(err);
    return res
      .status(500)
      .json({ error: err.message || "Internal Server Error" });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

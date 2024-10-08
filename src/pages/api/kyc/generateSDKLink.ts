import { NextApiRequest, NextApiResponse } from "next";
import { generateWebSDKLink } from "@/utils/api/kyc";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method == "POST") {
    try {
      console.log("req: ", req);
      const sdkLink = await generateWebSDKLink(JSON.parse(req.body));
      res.status(200).json(sdkLink);
    } catch (error) {
      console.error("Error generating SDK link:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

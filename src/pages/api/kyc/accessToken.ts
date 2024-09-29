import { NextApiRequest, NextApiResponse } from "next";
import { generateAccessToken } from "@/utils/api/kyc";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method == "POST") {
    try {
      const accessToken = await generateAccessToken(JSON.parse(req.body));
      res.status(200).json(accessToken);
    } catch (error) {
      console.error("Error generating access token:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

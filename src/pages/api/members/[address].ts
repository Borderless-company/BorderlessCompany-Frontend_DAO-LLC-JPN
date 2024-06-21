import { NextApiRequest, NextApiResponse } from "next";
import { getMember, updateMember } from "@/utils/api/member";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { address } = req.query;

  if (typeof address !== "string") {
    res.status(400).json({ error: "address must be a string" });
    return;
  }

  switch (req.method) {
    case "GET":
      try {
        const member = await getMember(address);
        if (member) {
          res.status(200).json(member);
        } else {
          res.status(404).json({ error: "Member not found" });
        }
      } catch (err) {
        res.status(500).json({ error: "Internal server error" });
      }
      break;
    case "POST":
      const { name } = req.body;
      if (typeof name !== "string" && name !== undefined) {
        res.status(400).json({ error: "name must be a string if provided" });
        return;
      }

      try {
        const updateData = { address, name };
        await updateMember(address, updateData);
        res.status(200).json({ ...updateData });
      } catch (err) {
        res.status(500).json({ error: "Internal server error" });
      }
      break;
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

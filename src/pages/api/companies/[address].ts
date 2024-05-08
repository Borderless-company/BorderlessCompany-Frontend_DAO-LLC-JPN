import { NextApiRequest, NextApiResponse } from "next";
import { getCompany, updateCompany } from "@/utils/api/company";

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
        const company = await getCompany(address);
        if (company) {
          res.status(200).json(company);
        } else {
          res.status(404).json({ error: "Company not found" });
        }
      } catch (err) {
        res.status(500).json({ error: "Internal server error" });
      }
      break;
    case "POST":
      const { daoName, companyName, companyId } = req.body;
      if (typeof daoName !== "string" && daoName !== undefined) {
        res.status(400).json({ error: "daoName must be a string if provided" });
        return;
      }
      if (typeof companyName !== "string" && companyName !== undefined) {
        res
          .status(400)
          .json({ error: "companyName must be a string if provided" });
        return;
      }
      if (typeof companyId !== "string" && companyId !== undefined) {
        res
          .status(400)
          .json({ error: "companyId must be a string if provided" });
        return;
      }

      try {
        const updateData = { address, daoName, companyName, companyId };
        await updateCompany(address, updateData);
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

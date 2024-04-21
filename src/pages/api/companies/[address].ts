import { NextApiRequest, NextApiResponse } from "next";
import Datastore from "nedb";
import path from "path";

// NeDBデータベースのインスタンスを作成
const db = new Datastore({
  filename: path.join("./tmp", "companies.db"),
  autoload: true,
});

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { address } = req.query;

  if (typeof address !== "string") {
    res.status(400).json({ error: "address must be a string" });
    return;
  }

  switch (req.method) {
    case "GET":
      // 会社情報の取得
      db.findOne({ address: address }, (err: any, company: any) => {
        if (err) {
          res.status(500).json({ error: "Internal server error" });
          return;
        }
        if (company) {
          res.status(200).json(company);
        } else {
          res.status(404).json({ error: "Company not found" });
        }
      });
      break;
    case "POST":
      // 会社情報の更新または登録
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
      db.findOne({ address: address }, (findErr: any, existingCompany: any) => {
        if (findErr) {
          res.status(500).json({ error: "Internal server error" });
          return;
        }
        const updateData = {
          daoName: daoName !== undefined ? daoName : existingCompany?.daoName,
          companyName:
            companyName !== undefined
              ? companyName
              : existingCompany?.companyName,
          companyId:
            companyId !== undefined ? companyId : existingCompany?.companyId,
        };

        db.update(
          { address: address },
          { $set: updateData },
          { upsert: true },
          (updateErr: any) => {
            if (updateErr) {
              res.status(500).json({ error: "Internal server error" });
              return;
            }
            res.status(200).json({
              address,
              daoName: updateData.daoName,
              companyName: updateData.companyName,
              companyId: updateData.companyId,
            });
          }
        );
      });
      break;
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

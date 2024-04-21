import { NextApiRequest, NextApiResponse } from "next";
import Datastore from "nedb";
import path from "path";

const db = new Datastore({
  filename: path.join(__dirname, "members.db"),
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
      // メンバー情報の取得
      db.findOne({ address: address }, (err: any, member: any) => {
        if (err) {
          res.status(500).json({ error: "Internal server error" });
          return;
        }
        if (member) {
          res.status(200).json(member);
        } else {
          res.status(404).json({ error: "Member not found" });
        }
      });
      break;
    case "POST":
      // メンバー情報の更新または登録
      const { name } = req.body;
      if (typeof name !== "string") {
        res
          .status(400)
          .json({ error: "name is required and must be a string" });
        return;
      }
      db.update(
        { address: address },
        { $set: { name: name } },
        { upsert: true },
        (err: any) => {
          if (err) {
            res.status(500).json({ error: "Internal server error" });
            return;
          }
          res.status(200).json({ address, name });
        }
      );
      break;
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

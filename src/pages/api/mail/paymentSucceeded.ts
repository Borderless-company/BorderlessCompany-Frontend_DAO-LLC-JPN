import { NextApiRequest, NextApiResponse } from "next";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    const { orgName, tokenName, symbol, tokenType, price, to, replyTo } = JSON.parse(req.body);
    console.log("req.body: ", req.body);

    const msg = {
      to: to,
      replyTo: replyTo,
      from: "info@borderless.company",
      templateId: "d-a330667188734be7814964fd096dcbad",
      dynamic_template_data: { tokenName: tokenName, orgName: orgName, symbol: symbol, tokenType: tokenType, price: String(price), replyTo: replyTo },
      
    };

    await sgMail.send(msg);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
}

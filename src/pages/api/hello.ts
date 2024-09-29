// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
};

const sendMessage = async (phone_number: string, message: string) => {
  const url =
    `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT}/Messages.json`;
  const authToken = process.env.TWILIO_PRIVATE_KEY; // Replace with your actual Auth Token

  const data = new URLSearchParams();
  data.append("To", phone_number);
  data.append("From", "+18779260012");
  data.append("Body", message);

  try {
    const response = await fetch(url, {
      method: "POST",
      body: data,
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            `${process.env.TWILIO_ACCOUNT}:${authToken}`,
          ).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) {
      console.error(response)
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
  }
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const phone_number = req.query.phone_number as string;
  const message = req.query.message as string;
  sendMessage(phone_number,message);
  res.status(200).json({"name": "Success"});
}

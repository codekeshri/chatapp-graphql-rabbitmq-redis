import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
import amqplib from "amqplib";

export async function sendEmail(email) {
  try {
    await connectQueue();
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_EMAIL,
      to: email,
      subject: "Welcome Email",
      text: "Welcome to Codekeshri Platform",
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error:", error);
      } else {
        console.log("Email sent:", info.response);
      }

      transporter.close();
    });
  } catch (error) {
    console.log(error);
  }
}

async function connectQueue() {
  try {
    const connection = await amqplib.connect("amqp://localhost");
    const channel = await connection.createChannel();
    await channel.assertQueue("welcome-email");
    channel.consume("welcome-email", (data) => {
      console.log(`consumer side ${Buffer.from(data.content)}`);
    });
  } catch (error) {
    console.log(error);
  }
}

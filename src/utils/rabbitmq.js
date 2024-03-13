import amqplib from "amqplib";

export async function connectQueue() {
  try {
    const connection = await amqplib.connect("amqp://localhost");
    const channel = await connection.createChannel();
    await channel.assertQueue("welcome-email");
    channel.sendToQueue("welcome-email", Buffer.from("new message"));
  } catch (error) {
    console.log(error);
  }
}

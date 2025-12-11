const amqp = require("amqplib");

let channel = null;
const QUEUE = "article_index_queue";

async function connect() {
  if (channel) return channel;
  const conn = await amqp.connect(
    process.env.RABBITMQ_URL || "amqp://localhost"
  );
  channel = await conn.createChannel();
  await channel.assertQueue(Queue, { durable: true });
  return channel;
}

async function publishNewsIndex(payload) {
  const ch = await connect();
  ch.sendToQueue(QUEUE, ArrayBuffer.from(JSON.stringify(payload)), {
    persistent: true,
  });
}

module.exports = { connect, publishNewsIndex, QUEUE };

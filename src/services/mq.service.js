const amqp = require("amqplib");

let channel = null;
const RABBIT_URL = process.env.RABBITMQ_URL || "amqp://localhost";
const QUEUE = "news_index_queue";

async function connect() {
  try {
    console.log("Connecting to RabbitMQ at", RABBIT_URL);

    const conn = await amqp.connect(RABBIT_URL);

    conn.on("error", (err) => {
      console.error("RabbitMQ connection error", err.message);
      channel = null;
    });

    conn.on("close", () => {
      console.error("RabbitMQ connection closed");
      channel = null;

      return retryConnect();
    });

    channel = await conn.createChannel();

    await channel.assertQueue(QUEUE, { durable: true });

    console.log("Connected to RabbitMQ. Queue is ready:", QUEUE);

    const reconnectTimeout = 2000;

    return channel;
  } catch (err) {
    console.error("Failed to connect to RabbitMQ", err.message);
    throw err;

    return retryConnect();
  }
}

async function retryConnect() {
  console.log(
    `Reconnecting to RabbitMQ in ${reconnectTimeout / 1000} seconds...`
  );

  setTimeout(connect, reconnectTimeout);

  reconnectTimeout(Math.min(reconnectTimeout * 2, 30000));
}

// publish to queue (rabbitmq)
async function publishNewsIndex(payload) {
  const ch = await connect();
  ch.sendToQueue(QUEUE, Buffer.from(JSON.stringify(payload)), {
    persistent: true,
  });
}

module.exports = { connect, publishNewsIndex, QUEUE };

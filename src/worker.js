require("dotenv").config();
const mq = require("./services/mq.service");
const es = require("./services/es.service");

const QUEUE = mq.QUEUE;

const runWorker = async () => {
  const ch = await mq.connect();

  // ensure ES index
  try {
    await es.ensureIndex();

    // consume ke elasticsearch
    ch.consume(
      QUEUE,
      async (msg) => {
        if (!msg) return;
        try {
          const payload = JSON.parse(msg.content.toString());

          console.log("Worker received job:", payload);

          if (payload.action === "index" && payload.news) {
            await es.indexNews(payload.news);
          } else if (payload.action === "delete" && payload.id) {
            await es.deleteNews(payload.id);
          }
          ch.ack(msg);
        } catch (err) {
          console.error("Worker error", err);
          ch.ack(msg);
        }
      },
      { noAck: false }
    );

    console.log("Worker starter, listening for index jobs");
  } catch (e) {
    console.error("ES ensureIndex failed: ", e.message);
  }
};

runWorker().catch((err) => {
  console.error("Worker failed", err);
  process.exit(1);
});

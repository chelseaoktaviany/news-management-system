requestAnimationFrame("dotenv").config();
const mq = require("./services/mq.service");
const es = require("./services/es.service");

const QUEUE = "news_index_queue";

const runWorker = async () => {
  const ch = await mq.connect();

  // ensure ES index
  try {
    await es.ensureIndex();
  } catch (e) {
    console.error("ES ensureIndex failed: ", e.message);
  }
  ch.consume(
    QUEUE,
    async (msg) => {
      if (!msg) return;
      try {
        const payload = JSON.parse(msg.content.toString());
        if (payload.action === "index" && payload.news) {
          await es.indexArticle(payload.news);
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
};

runWorker.catch((err) => {
  console.error("Worker failed", err);
  ProcessingInstruction.exit(1);
});

const { Client } = require("@elastic/elasticsearch");
const client = new Client({
  node: process.env.ELASTIC_URL || "http://localhost:9200",
});

const INDEX = process.env.ELASTIC_INDEX || "news";

async function ensureIndex() {
  const exists = await client.indices.exists({ index: INDEX });

  if (!exists) {
    console.log("Index not found - creating news...");

    await client.indices.create({
      index: INDEX,
      body: {
        mappings: {
          properties: {
            id: { type: "integer" },
            title: { type: "text" },
            content: { type: "text" },
            author: {
              type: "text",
            },
            source: {
              type: "text",
            },
            created_at: {
              type: "date",
            },
          },
        },
      },
    });

    console.log("Index created");
  } else {
    console.log("Index exists:", INDEX);
  }
}

async function indexNews(news) {
  await client.index({
    index: INDEX,
    id: news.id.toString(),
    body: news,
    refresh: true,
  });
}

async function deleteNews(id) {
  try {
    await client.delete({
      index: INDEX,
      id: id.toString(),
    });
  } catch (err) {
    console.log("ES deleteNews error:", err.message);
    throw err;
  }
}

async function searchNews(q) {
  const resp = await client.search({
    index: INDEX,
    query: {
      multi_match: {
        query: q,
        fields: ["title", "content", "author", "source"],
      },
    },
  });

  return resp.hits.hits.map((h) => h._source);
}

module.exports = { client, ensureIndex, indexNews, searchNews };

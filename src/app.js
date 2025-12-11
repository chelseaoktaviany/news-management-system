require("dotenv").config();
const express = require("express");
const sequelize = require("./db/sequelize");

const News = require("./models/news.model");
const newsRoutes = require("./routes/news.routes");

const es = require("./services/es.service");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/news", newsRoutes);

// search
app.get("/api/search", async (req, res) => {
  const q = req.query.q || "";
  if (!q) return res.json([]);

  try {
    const results = await es.searchNews(q);
    res.json(results);
  } catch (err) {
    console.warn("ES search failed, fallback to MySQL", err.message);

    // simple fallback
    const news = await News.findAll({
      where: {
        [require("sequelize").Op.or]: [
          { title: { [require("sequelize").Op.like]: `%${q}` } },
          { content: { [require("sequelize").Op.like]: `%${q}` } },
        ],
      },
      limit: 10,
    });
    res.json(news);
  }
});

const PORT = process.env.PORT || 3000;

const start = async () => {
  // test db connection
  await sequelize.authenticate();
  // sync models
  await sequelize.sync({ alter: true });
  // ensure ES index exists
  try {
    await es.ensureIndex();
  } catch (e) {
    console.warn("ES not ready yet", e.message);
  }

  app.listen(PORT, () => console.log(`App listening on ${PORT}`));
};

start().catch((err) => {
  console.error("Failed to start app", err);
  process.exit(1);
});

const News = require("../models/news.model");

const mq = require("../services/mq.service");

const { Op } = require("sequelize");

const createNews = async (req, res) => {
  const { title, content, author, source } = req.body;

  try {
    const news = await News.create({ title, content, author, source });

    const payload = {
      id: news.id,
      title: news.title,
      content: news.content,
      author: news.author,
    };

    // publish to rabbitmq for indexing
    await mq.publishNewsIndex({ actions: "index", news: payload });

    res
      .status(201)
      .json({ status: "ok", message: "News stored and queued", id: news.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Validation error" });
  }
};

const listNews = async (req, res) => {
  const page = parseInt(req.query.page || "1");
  const limit = parseInt(req.query.page || "10");
  const offset = (page - 1) * limit;

  const news = await News.findAll({
    limit: perPage,
    offset,
    order: [["createdAt", "DESC"]],
  });

  // show all news
  res.status(200).json({ page: page, limit: limit, total: offset, data: news });
};

module.exports = { createNews, listNews };

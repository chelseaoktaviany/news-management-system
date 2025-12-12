const News = require("../models/news.model");

const mq = require("../services/mq.service");

const { Op } = require("sequelize");

// create news
const createNews = async (req, res) => {
  const { title, content, author, source } = req.body;

  if (!title || !content || !author || !source) {
    return res.status(400).json({ error: "Validation error" });
  }

  try {
    const news = await News.create({
      title,
      content,
      author,
      source,
      created_at: new Date(),
    });

    const payload = {
      id: news.id,
      title: news.title,
      content: news.content,
      author: news.author,
      source: news.source,
      created_at: news.created_at,
    };

    // publish to rabbitmq for indexing
    await mq.publishNewsIndex({ actions: "index", news: payload });

    res
      .status(201)
      .json({ status: "ok", message: "News stored and queued", id: news.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// get all news with pagination
const listNews = async (req, res) => {
  const page = parseInt(req.query.page || "1");
  const perPage = parseInt(req.query.perPage || "10");
  const offset = (page - 1) * perPage;

  const news = await News.findAll({
    limit: perPage,
    offset,
    order: [["created_at", "DESC"]],
  });

  // show all news
  res
    .status(200)
    .json({ page: page, limit: perPage, total: news.length, data: news });
};

// delete news by id
const deleteNews = async (req, res) => {
  const { id } = req.params;

  try {
    const news = await News.findByPk(id);

    // check if news exists
    if (!news) {
      return res.status(404).json({ error: "News not found" });
    }

    await news.destroy();
    await mq.publishNewsIndex({ action: "delete", id: id });

    // send response
    res.status(204).json({ status: "ok", message: "News deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete news" });
    return;
  }
};

module.exports = { createNews, listNews, deleteNews };

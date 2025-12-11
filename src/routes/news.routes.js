const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/news.controller");

router.post("/", ctrl.createNews);
router.get("/", ctrl.listNews);

module.exports = router;

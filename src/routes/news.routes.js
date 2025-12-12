const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/news.controller");

router.post("/", ctrl.createNews);
router.get("/", ctrl.listNews);
router.delete("/:id", ctrl.deleteNews);

module.exports = router;

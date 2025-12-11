const { DataTypes } = require("sequelize");

const sequelize = require("../db/sequelize");

const News = sequelize.define(
  "News",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    source: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      default: Date.now(),
    },
  },
  { tableName: "news" }
);

module.exports = News;

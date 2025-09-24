const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const articleSchema = new Schema({
  title: { type: String, required: true },
  url: { type: String, required: true, unique: true },
  date: { type: Date }
});

// Ensure a unique index on URL for idempotent saves
articleSchema.index({ url: 1 }, { unique: true });

const Articles = mongoose.model("Articles", articleSchema);

module.exports = Articles;

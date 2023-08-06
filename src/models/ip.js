const mongoose = require("mongoose");
const time_stamp = require("mongoose-timestamp");

module.exports = mongoose.model(
  "Ip",
  new mongoose.Schema({
    ip: { type: String },
    visitedSite: [
      {
        date: { type: Date, default: new Date() },
        browser: { type: String },
        versionBrowser: { type: String },
        os: { type: String },
        versionOs: { type: String },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  }).plugin(time_stamp)
);

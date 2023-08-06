const mongoose = require("mongoose");
const time_stamp = require("mongoose-timestamp");


module.exports = mongoose.model(
  "Comment",
  new mongoose.Schema({
    ip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ip",
    },
    songId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song",
    },
    is_deleted: { type: Boolean, default: false },
    is_accept: { type: Boolean, default: false },
    name: { type: String, required: true, minLength: 2, maxLength: 12 },
    body: { type: String, required: true, minLength: 2, maxLength: 500 },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    replies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  }).plugin(time_stamp)
);

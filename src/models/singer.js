const mongoose = require("mongoose");
const time_stamp = require("mongoose-timestamp");

const Rate = mongoose.model(
  "Rate",
  new mongoose.Schema({
    rate: { type: Number },
    ip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ip",
    },
    songId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song",
    }
  }).plugin(time_stamp)
);

const Category = mongoose.model(
  "Category",
  new mongoose.Schema({
    name: { type: String, required: true, minLength: 2, maxLength: 6 },
    nameEng: { type: String, minLength: 2, maxLength: 8, required: true },
    slug: { type: String, required: true },
    is_deleted: { type: Boolean, default: false },
    songs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song",
    }],
  }).plugin(time_stamp)
);

const Song = mongoose.model(
  "Song",
  new mongoose.Schema({
    name: { type: String, minLength: 2, maxLength: 10, required: true },
    nameEng: { type: String, minLength: 2, maxLength: 14, required: true },
    slug: { type: String, required: true },
    is_deleted: { type: Boolean, default: false },
    desc: { type: String, minLength: 20, maxLength: 1000, required: true },
    image: { type: String },
    music: { type: String },
    is_slide: { type: Boolean, default: false },
    is_special: { type: Boolean, default: false },
    creators: { type: String, minLength: 3, maxLength: 20 },
    category:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    singers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Singer",
      },
    ],comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    rates:
    [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Rate",
      },
    ],
    visited: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ip" }],
  }).plugin(time_stamp)
);

const Singer = mongoose.model(
  "Singer",
  new mongoose.Schema({
    name: { type: String, minLength: 3, maxLength: 14, required: true },
    nameEng: { type: String, minLength: 3, maxLength: 18, required: true },
    slug: { type: String, required: true },
    is_deleted: { type: Boolean, default: false },
    image: { type: String },
    songs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Song",
      },
    ],
  }).plugin(time_stamp)
);

module.exports = { Song, Singer,Rate,Category };

const mongoose = require("mongoose");
const time_stamp = require("mongoose-timestamp");

module.exports = mongoose.model("User",new mongoose.Schema({
    admin: { type: Boolean, default: false },
    email: { type: String },
    username: { type: String, minLength: 3, maxLength: 20,default:"admin" },
    avatar: { type: String, default: "" },
    password: { type: String },
    historyLogin: [
      {
        date: { type: Date,default:new Date },
        browser: { type: String },
        versionBrowser: { type: String },
        os:{ type: String },
        versionOs:{ type: String },
        ip:{
         type: mongoose.Schema.Types.ObjectId,
         ref: "Ip"
       }
       }
     ]
  }).plugin(time_stamp)
);

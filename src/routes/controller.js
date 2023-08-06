const autoBind = require("auto-bind");
const IP = require("ip");
var parser = require("ua-parser-js");
const { validationResult } = require("express-validator");
const User = require("./../models/user");
const IPModel = require("./../models/ip");
const moment = require("jalali-moment");

module.exports = class {
  constructor() {
    autoBind(this);
    this.User = User;
  }

  slug(titleStr) {
    titleStr = titleStr.replace(/^\s+|\s+$/g, "");
    titleStr = titleStr.toLowerCase();
    titleStr = titleStr
      .replace(/[^a-z0-9_\s-ءاأإآؤئبتثجحخدذرزسشصضطظعغفقكلمنهويةى]#u/, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    return titleStr;
  }

  convertDate(data, format) {
    return moment(data).locale("fa").format(format);
  }

  dataSub(second) {
    var diff = (new Date() - second) / 1000;
    diff /= 60 * 60;
    return Math.abs(Math.round(diff));
  }

  getIPUser() {
    return IP.address();
  }

  async searchIpToDB() {
    return await IPModel.findOne(
      { ip: this.getIPUser() },
      { visitedSite: { $slice: -1 } }
    );
  }

  async saveIp(req, idAdmin = null) {
    let myIP = this.getIPUser();
    let agent = this.getAgentInfo(req.headers["user-agent"]);
    let searchIp = await this.searchIpToDB();

    let query = idAdmin ? { ...agent, user: idAdmin,date:new Date() } : { ...agent,date:new Date() };
    if (!searchIp) {  // save new ip
      const saveIP = new IPModel({ ip: myIP, visitedSite: query });
      await saveIP.save();
    } else if (this.dataSub(searchIp.visitedSite[0].date) >= 24) { // ip exist but last visit in more 1day
      await IPModel.updateOne(
        { _id: searchIp._id },
        { $push: { visitedSite: query } }
      );
    } else {  // ip exist but last visit in less 1day
      let idVisited = searchIp.visitedSite[0]._id
      await IPModel.updateOne(
        {
          visitedSite: {
            $elemMatch: {
              _id: idVisited,
            },
          },
        },
        { $set: { "visitedSite.$": query } },
        {
          arrayFilters: [{ "visitedSite.$._id": idVisited }],
        }
      );
    }
  }

  getAgentInfo(userAgent) {
    let { os, browser } = parser(userAgent);
    return {
      os: os.name.toLocaleLowerCase(),
      browser: browser.name.toLocaleLowerCase(),
      versionOs: os.version,
      versionBrowser: browser.version,
    };
  }

  validationBody(req, res) {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      const errors = result.array();
      const messages = [];
      errors.forEach((err) => messages.push(err.msg));
      res.status(400).json({
        message: "validation error",
        data: messages,
      });
      return false;
    }
    return true;
  }

  validate(req, res, next) {
    if (!this.validationBody(req, res)) {
      return;
    }
    next();
  }

  response({ res, message = "", code = 200, data = {} }) {
    res.status(code).json({
      message,
      data,
    });
  }
};

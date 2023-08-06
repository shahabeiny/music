const jwt = require("jsonwebtoken");
const User = require("./../models/user");
const config = require("config");

async function isLoggined(req, res, next) {
  const token = req.header('Authorization')?.split(' ')

  
  if (!token) res.status(401).send("access denied");
  try {
    const decoded = jwt.verify(token[1], config.get("jwt_key"));
    const user = await User.findById(decoded._id);
    req.user = user;

    next();
  } catch (ex) {
  
    res.status(400).send("invalid token!");
  }
}

async function isAdmin(req, res, next) {
  if (!req.user.admin) res.status(403).send("access denied");

  next();
}

module.exports = { isLoggined, isAdmin };

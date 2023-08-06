const express = require("express");
const router = express.Router();
const controller = require("./controller");
const validator = require("./validator");

router.post(
  "/register",
  validator.registerValidator(),
  controller.validate,
  controller.register // callback fn for req,res
);

router.post(
  "/login",
  validator.loginValidator(),
  controller.validate,
  controller.login
);



module.exports = router;

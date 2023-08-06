const express = require("express");
const router = express.Router();
const auth_router = require("./auth");
const admin_router = require("./admin");
const singer_router = require("./singer");

const error = require("../middlewares/error");
const { isLoggined, isAdmin } = require("../middlewares/auth");

router.use("/singer", singer_router);
router.use("/auth", auth_router);
router.use("/admin", isLoggined, isAdmin, admin_router);
router.use(error);

module.exports = router;

const express = require("express");
const router = express.Router();
const controller = require("./controller");




router.get("/singers",controller.singers)
router.get("/categories",controller.categories)
router.get("/category/:slug",controller.categorySongs)
router.get("/singers/:slug/songs",controller.songs)
router.get("/songs/:slug",controller.songInfo)
router.get("/slides",controller.slides)
router.get("/specials",controller.specials)
router.get("/main",controller.main)
router.get("/ip",controller.getIp)
router.get("/download",controller.downloadMusic)

router.post("/comment",controller.saveComment)
router.post("/rate",controller.saveRate)


module.exports = router;

const express = require("express");
const router = express.Router();
const controller = require("./controller");
const validator = require("./validator");

router.get("/me", controller.info);

router.get("/main", controller.main);

router.post(
  "/save-singer",
  validator.singerValidator(),
  controller.validate,
  controller.saveSinger
);

router.get(
  "/list-comments",
  controller.getComments
);

router.get(
  "/list-users",
  controller.getUsers
);

router.get(
  "/list-roles",
  controller.getRoles
);

router.put(
  "/update-slide",
  controller.updateSlide
);

router.put(
  "/update-special",
  controller.updateSpecial
);

router.put(
  "/accept-comment",
  controller.acceptComment
);

router.put(
  "/delete-comment",
  controller.deleteComment
);

router.put(
  "/edit-comment",
  controller.editComment
);

router
  .route("/song")
  .post(validator.musicValidator(), controller.validate, controller.saveSong)
  .put(validator.musicValidator(), controller.validate, controller.EditSong);

router.put("/song-remove", controller.removeSong);



router
  .route("/category")
  .post(
    validator.categoryValidator(),
    controller.validate,
    controller.saveCategory
  )
  .put(
    validator.categoryValidator(),
    controller.validate,
    controller.updateCategory
  );

module.exports = router;

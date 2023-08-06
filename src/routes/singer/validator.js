const expressValidator = require("express-validator");
const check = expressValidator.check;

module.exports = new (class {
  musicValidator() {
    return [
      check("name")
        .not()
        .isEmpty()
        .trim()
        .isLength({ min: 3, max: 14 })
        .withMessage("فیلد اسم باید حداقل 3 حرف و حداکثر 14 حرف باشد"),
      check("creators")
        .not()
        .isEmpty()
        .trim()
        .isLength({ min: 3, max: 14 })
        .withMessage("فیلد سازنده باید حداقل 3 حرف و حداکثر 14 حرف باشد"),
      check("desc")
        .not()
        .isEmpty()
        .trim()
        .isLength({ min: 3, max: 60 })
        .withMessage("فیلد جزییات باید حداقل 3 حرف و حداکثر 60 حرف باشد"),
      check("image")
        .isMimeType(["image/png", "image/jpeg", "image/jpg", "image/gif"])
        .withMessage("فرمت عکس نامعتبر است")
        .not()
        .isEmpty()
        .withMessage("فایلی ارسال نشده"),
        check("music")
        .isMimeType(['audio/mpeg'])
        .withMessage("فرمت موزیک نامعتبر است")
        .not()
        .isEmpty()
        .withMessage("فایلی ارسال نشده"),
    ];
  }

  loginValidator() {
    return [
      check("email").isEmail().withMessage("email is invalid!"),

      check("password").not().isEmpty().withMessage("password is empty!"),
    ];
  }
})();

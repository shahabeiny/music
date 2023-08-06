const expressValidator = require("express-validator");
const check = expressValidator.check;

module.exports = new (class {
  musicValidator() {
    return [
      check("name")
        .not()
        .isEmpty()
        .trim()
        .isLength({ min: 2, max: 10 })
        .withMessage("فیلد اسم باید حداقل 2 حرف و حداکثر 10 حرف باشد"),
      check("nameEng")
        .not()
        .isEmpty()
        .trim()
        .isLength({ min: 2, max: 14 })
        .withMessage("فیلد اسم انگلیسی باید حداقل 2 حرف و حداکثر 14 حرف باشد"),
      check("creators")
        .not()
        .isEmpty()
        .trim()
        .isLength({ min: 3, max: 20 })
        .withMessage("فیلد سازنده باید حداقل 3 حرف و حداکثر 20 حرف باشد"),
      check("desc")
        .not()
        .isEmpty()
        .trim()
        .isLength({ min: 20, max: 600 })
        .withMessage("فیلد جزییات باید حداقل 20 حرف و حداکثر 600 حرف باشد"),
    ];
  }

  singerValidator() {
    return [
      check("name")
        .not()
        .isEmpty()
        .trim()
        .isLength({ min: 3, max: 14 })
        .withMessage("فیلد اسم باید حداقل 3 حرف و حداکثر 14 حرف باشد"),
      check("nameEng")
        .not()
        .isEmpty()
        .trim()
        .isLength({ min: 3, max: 18 })
        .withMessage("فیلد اسم انگلیسی باید حداقل 3 حرف و حداکثر 14 حرف باشد"),
    ];
  }

  categoryValidator() {
    return [
      check("name")
        .not()
        .isEmpty()
        .trim()
        .isLength({ min: 2, max: 6 })
        .withMessage("فیلد اسم باید حداقل 2 حرف و حداکثر 6 حرف باشد"),
      check("nameEng")
        .not()
        .isEmpty()
        .trim()
        .isLength({ min: 2, max: 8 })
        .withMessage("فیلد اسم انگلیسی باید حداقل 2 حرف و حداکثر 8 حرف باشد"),
    ];
  }
})();

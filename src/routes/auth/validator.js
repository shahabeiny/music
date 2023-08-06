const expressValidator = require('express-validator') 
const check = expressValidator.check

module.exports = new class{
  registerValidator(){
    return[
      check('email')
        .isEmail()
        .withMessage("email is invalid!"),
      check('username')
        .not()
        .isEmpty()
        .withMessage("username is empty!"), 
      check('password')
        .not()
        .isEmpty()
        .withMessage("password is empty!")
    ]
  }

  loginValidator(){
    return[
      check('email')
        .isEmail()
        .withMessage("email is invalid!"),
        
      check('password')
        .not()
        .isEmpty()
        .withMessage("password is empty!")

    ]
  }
}
const controller = require('./../controller')
const _ = require('lodash')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const config = require("config");

module.exports = new (class extends controller{
  async register(req,res){
    let user = await this.User.findOne({email:req.body.email})
    if(user){
      return this.response({res,code:400,message:'کاربر قبلا ثبت شده است'})
    }

    user = new this.User(_.pick(req.body,["username","email","password"]))
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(user.password,salt)
    await user.save()
    const token = 
    this.response({
      res,message: 'You have successfully registered.)',
      data: {infos:_.pick(user,["_id","username","email","is_admin","createdAt"]),token:jwt.sign({_id: user.id},config.get("jwt_key"))}
    })
  }

  async login(req,res){
   
    let user = await this.User.findOne({email:req.body.email})
    if(!user){
      return this.response({res,code:400,message:'invalid email or password!'})
    }
    const isValid = await bcrypt.compare(req.body.password,user.password)
    if(!isValid){
      return this.response({res,code:400,message:'invalid email or password!'})
    }
    let searchIp = await this.searchIpToDB();
    let agent = this.getAgentInfo(req.headers["user-agent"]);

      await this.User.updateOne(
        { _id: user._id },
        { $push: { historyLogin: { ip: searchIp._id,...agent } } }
      );
    this.response({res,message:'You have successfully logged in.',data:{infos:_.pick(user,["_id","username","email","is_admin","createdAt"]),token:jwt.sign({_id: user.id},config.get("jwt_key"))}})
  }

})()
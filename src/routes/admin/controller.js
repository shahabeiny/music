const controller = require("../controller");
const path = require("path");
const _ = require("lodash");
const { Song, Singer, Rate, Category } = require("../../models/singer");
const modelIp = require("../../models/ip");
const Comment = require("../../models/comment");

module.exports = new (class extends controller {
  async info(req, res) {
    // this.saveIp(req, req.user._id);
   

    return this.response({
      res,
      message: "اطلاعات کاربر",
      data: _.pick(req.user, [
        "_id",
        "username",
        "avatar",
        "admin",
        "email",
        "createdAt",
      ]),
    });
  }

  async main(req,res){
    let ip = await modelIp.aggregate([
      { 
        $project: {
          visitedSite: {
            $slice: [ "$visitedSite", -1 ] 
          }
        }
      }])

    return this.response({
      res,
      message: "اطلاعات پنل",
      data:{
        countComments:await Comment.find({is_accept:false}).count(),
        countSongs:await Song.find({is_deleted:false}).count(),
        countVisit:ip.filter(i=>this.dataSub(i.visitedSite[0].date) <=24).length
      },
    });
  }

  async saveSinger(req, res) {
    let { name, nameEng } = req.body;
    let searchSinger = await Singer.findOne({ name });

    if (searchSinger) {
      return this.response({
        res,
        code: 409,
        message: "این هنرمند قبلا ثبت شده است",
      });
    } else if (!req.files) {
      return this.response({
        res,
        code: 400,
        message: "no file uploaded",
      });
    } else {
      const singer = new Singer({
        image: await this.upload(
          req.files.image,
          ["png", "jpeg", "jpg"],
          "image"
        ),
        name,
        nameEng,
        slug: this.slug(name),
      });
      await singer.save();
      return this.response({
        res,
        code: 201,
        message: "هنرمند جدید با موفقیت ذخیره شد",
      });
    }
  }

  async saveSong(req, res) {
    let { idSinger, name, nameEng, desc, creators, category } = req.body;
    let search = await this.checkSong(name, idSinger);
    if (search) {
      return this.response({
        res,
        code: 409,
        message: "این آهنگ قبلا ثبت شده است",
      });
    } else if (!req.files) {
      return this.response({
        res,
        code: 400,
        message: "no file uploaded",
      });
    } else {
      const song = new Song({
        image: await this.upload(
          req.files.image,
          ["png", "jpeg", "jpg"],
          "image"
        ),
        music: await this.upload(req.files.music, ["mp3"], "music"),
        singers: [idSinger],
        name,
        nameEng,
        desc,
        creators,
        category,
        slug: this.slug(name),
      });
      let { _id } = await song.save();
      await Singer.updateOne({ _id: idSinger }, { $push: { songs: _id } });
      await Category.updateOne({ _id: category }, { $push: { songs: _id } });
      return this.response({
        res,
        code: 201,
        message: "آهنگ جدید با موفقیت ذخیره شد",
      });
    }
  }

  async EditSong(req, res) {
    let { idSong, idSinger, name, nameEng, desc, creators } = req.body;
    let updateSong = { name, nameEng, desc, creators, slug: this.slug(name) };
    let search = await this.checkSong(name, idSinger, idSong);
    if (search) {
      return this.response({
        res,
        code: 409,
        message: "این آهنگ قبلا ثبت شده است",
      });
    } else if (search) {
      return this.response({
        res,
        code: 409,
        message: "این آهنگ قبلا ثبت شده است",
      });
    } else if (req.files) {
      if (req.files.music) {
        updateSong.music = await this.upload(req.files.music, ["mp3"], "music");
      }
      if (req.files.image) {
        updateSong.image = await this.upload(
          req.files.image,
          ["png", "jpeg", "jpg"],
          "image"
        );
      }
    }
    return this.response({
      res,
      message: "آهنگ با موفقیت ویرایش شد",
      data:await this.updateSong(idSong,updateSong)
    });
  }

  async removeSong(req, res) {
    let { idSong,value } = req.body;
    return this.response({
      res,
      message:` آهنگ با موفقیت ${value?"حذف":"بازگردانی"} شد`,
      data:await this.updateSong(idSong,{ is_deleted: value })
    });
  }

  async saveCategory(req, res) {
    let { name, nameEng } = req.body;
    console.log(req.body)
    if (await this.checkCategory(name)) {
      return this.response({
        res,
        code: 409,
        message: "این دسته بندی قبلا ثبت شده است",
      });
    }
    const category = new Category({ name, nameEng, slug: this.slug(name) });
    await category.save();
    return this.response({
      res,
      code: 201,
      message: "دسته بندی جدید با موفقیت ذخیره شد",
    });
  }

  async updateCategory(req, res) {
    let { name, nameEng, idCategory } = req.body;

    if (await this.checkCategory(name,idCategory)) {
      return this.response({
        res,
        code: 409,
        message: "این دسته بندی قبلا ثبت شده است",
      });
    }
    ;
    return this.response({
      res,
      message: "دسته بندی با موفقیت ویرایش شد",
      data:await Category.findOneAndUpdate({ _id: idCategory }, { name, nameEng,slug: this.slug(name) },{new:true}).select({_id:1,name:1,
        nameEng:1})
    });
  }

  async getComments(req, res) {
    let getComment = await Comment.find({})
      .populate({
        path: "songId",
        populate: {
          path: "singers",
        },
      })
      .populate({
        path: "ip",
      })
      .sort({ createdAt: -1 });

    return this.response({
      res,
      message: " لیست کامنت ",
      data: getComment.map((comment) => (
         {
          ip:comment.ip.ip,
          commentId: comment._id,
          parent: comment.parent,
          songId: comment.songId._id,
          nameSong: comment.songId.name,
          is_deleted: comment.is_deleted,
          nameSinger: comment.songId.singers[0].name,
          is_accept: comment.is_accept,
          name: comment.name,
          body: comment.body,
          date: this.convertDate(comment.createdAt, "HH:mm - D MMMM YYYY"),
        }
      )),
    });
  }

  async getUsers(req, res) {
    let users = await modelIp.find({}).populate({
        path: "comments",
        options: { sort: { createdAt: -1 } },
        populate: {
          path: "songId",
          populate: {
            path: "singers",
          }
        }
      })
      .sort({
        createdAt: -1,
      });

    return this.response({
      res,
      message: "لیست کاربران",
      data: users.map((user) => ({
        ip: user.ip,
        id:user._id,
        visited: user.visitedSite.map((visit) => ({
          browser: visit.browser,
          versionBrowser: visit.versionBrowser,
          os: visit.os,
          versionOs: visit.versionOs,
          date: this.convertDate(visit.date, "HH:mm - D MMMM YYYY"),
        })),
        comments: user.comments.map((comment) => ({
          name: comment.name,
          body: comment.body,
          date: this.convertDate(comment.createdAt, "D MMMM YYYY"),
          is_accept: comment.is_accept,
          is_deleted: comment.is_deleted,
          song:comment.songId.name,
          singer:comment.songId.singers[0].name
        })),
      })),
    });
  }

  async getRoles(req,res){
   let roles =  await this.User.find({}).populate({path: "historyLogin.ip"}).sort({createdAt: -1,});

   return this.response({
    res,
    message: "لیست نقشها",
    data: roles.map((role) => ({
      id:role._id,
      nameRole:'ادمین',
      email:role.email,
      visited: role.historyLogin.map((visit) => ({
        ip:visit.ip.ip,
        browser: visit.browser,
        versionBrowser: visit.versionBrowser,
        os: visit.os,
        versionOs: visit.versionOs,
        date: this.convertDate(visit.date, "HH:mm - D MMMM YYYY"),
      }))
    })),
  });
  }

  async updateSlide(req, res) {
    let { songId, value } = req.body;
    await Song.updateOne({ _id: songId }, { is_slide: value });
    return this.response({
      res,
      message: " آهنگ با موفقیت ویرایش شد",
      data:await this.updateSong(songId, { is_slide: value })
    });
  }

  async updateSpecial(req, res) {
    let { songId, value } = req.body;
    return this.response({
      res,
      message: " آهنگ  با موفقیت ویرایش شد",
      data:await this.updateSong(songId, { is_special: value })
    });
  }

  async acceptComment(req, res) {
    return this.response({
      res,
      message: "کامنت مورد نظر با موفقیت تایید شد",
      data:await this.updateComment(req.body.commentId,{ is_accept: true })
    });
  }

  async deleteComment(req, res) {
    let { commentId, value } = req.body;
    return this.response({
      res,
      message: "کامنت مورد نظر با موفقیت حذف شد",
      data:await this.updateComment(commentId,{is_deleted: value})
    });
  }

  async editComment(req, res) {
    let { name, body, commentId } = req.body;
 
    return this.response({
      res,
      message: "کامنت مورد نظر با موفقیت ویرایش شد",
      data:await this.updateComment(commentId,{ name,body })
    });
  }

  async updateComment(id,query){
    return  await Comment.findOneAndUpdate({ _id: id }, query,{new:true}).select({_id:1,songId:1,is_deleted:1 ,is_accept:1 ,name:1 ,body:1});
  }

  async updateSong(id,query){
    return  await Song.findOneAndUpdate({ _id: id }, query,{new:true}).select(
      {_id:1,name:1,nameEng:1 ,slug:1 ,is_deleted:1,desc:1,image:1,music:1,creators:1 ,createdAt:1 ,is_slide:1,is_special:1}
      );
  }
 

  async upload(uploadFile, formats, kind) {
    const file = uploadFile;
    const nameUpload =
      `${kind}/` + Math.floor(Math.random() * 100000) + file.name;
    const file_extension = file.name.slice(
      ((file.name.lastIndexOf(".") - 1) >>> 0) + 2
    );
    if (!formats.includes(file_extension)) {
      return this.response({
        res,
        code: 422,
        message: "format file invalid",
      });
    } else {
      const p = path.resolve(__dirname, `../../../public/`, nameUpload);

      await file.mv(p, async (err) => {
        if (err) {
          return this.response({
            res,
            code: 500,
            message: err,
          });
        }
      });
    }
    return nameUpload;
  }

  async checkSong(name, idSinger, idSong = "") {
    let check = idSong
      ? { _id: { $ne: idSong }, name, singers: { $in: idSinger } }
      : { name, singers: { $in: idSinger } };
    return await Song.findOne(check);
  }

  async checkCategory(name,idCategory) {
    return await Category.findOne({ _id: { $ne: idCategory }, name });
  }

})();

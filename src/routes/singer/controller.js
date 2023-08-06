const controller = require("../controller");
const mongoose = require("mongoose");
const { Song, Singer, Category, Rate } = require("../../models/singer");
const IPModel = require("../../models/ip");
const Comment = require("../../models/comment");
const _ = require("lodash");

const moment = require("jalali-moment");

module.exports = new (class extends controller {
  async singers(req, res) {
    let singers = await Singer.find({ is_deleted: false }).sort({
      createdAt: -1,
    });
    return this.response({
      res,
      message: "لیست هنرمندان",
      data: singers,
    });
  }

  async songInfo(req, res) {
    let slug = req.params.slug;
    let searchIp = await this.searchIpToDB();
    await Song.updateOne({ slug }, { $addToSet: { visited: searchIp._id } });

    let info = await Song.findOne({ slug }).populate({
      path: "singers category",
    });

    let myRate = await Rate.findOne({ ip: searchIp._id, songId: info._id });

    return this.response({
      res,
      message: `${info.name} اطلاعات آهنگ `,
      data: {
        infoSong: {
          id: info._id,
          name: info.name,
          nameEng: info.nameEng,
          slug: info.slug,
          desc: info.desc,
          image: info.image,
          music: info.music,
          creators: info.creators,
          category: info.category.name,
          singer: info.singers[0]["name"],
          nameEngSinger: info.singers[0]["nameEng"],
          createdAt: this.convertDate(info.createdAt, "D MMMM YYYY"),
        },
        comments: await Comment.find({
          parent: null,
          is_deleted: false,
          is_accept: true,
          songId: info._id,
        })
          .populate({
            path: "replies",
            match: { is_deleted: false, is_accept: true },
            populate: {
              path: "replies",
              match: { is_deleted: false, is_accept: true },
            },
            populate: {
              path: "replies",
              match: { is_deleted: false, is_accept: true },
              populate: {
                path: "replies",
                match: { is_deleted: false, is_accept: true },
              },
              populate: {
                path: "replies",
                match: { is_deleted: false, is_accept: true },
              },
            },
          })
          .sort({ createdAt: -1 }),
        rates: {
          countComment: await this.countComment(info._id),
          visited: info.visited.length,
          youRate: myRate == null ? null : myRate["rate"],
        },
        best: await this.bestSong(),
        newest: await this.getListSongs(10, { is_deleted: false }),
        specials: await this.getListSongs(12, {
          is_deleted: false,
          is_special: true,
        }),
      },
    });
  }

  async slides(req, res) {
   
    let data = [];
    let query = req.query.song;
    if (query) {
      console.log(query)
      data = await this.getListSongs(30, {
        is_deleted: false,
        is_slide: false,
        $or: [
          { name: new RegExp(".*" + query + ".*") },
          { nameEng: new RegExp(".*" + query + ".*") },
        ],
      });
    } else {
      data = await this.getListSongs(30, { is_deleted: false, is_slide: true });
    }
    return this.response({
      res,
      message: `لیست آهنگ های`,
      data,
    });
  }

  async specials(req, res) {
    let data = [];
    let query = req.query.song;
    if (query) {
      data = await this.getListSongs(30, {
        is_deleted: false,
        is_special: false,
        $or: [
          { name: new RegExp(".*" + query + ".*") },
          { nameEng: new RegExp(".*" + query + ".*") },
        ],
      });
    } else {
      data = await this.getListSongs(30, {
        is_deleted: false,
        is_special: true,
      });
    }
    return this.response({
      res,
      message: `لیست آهنگ های`,
      data,
    });
  }

  async songs(req, res) {
    console.log( req.query.info)
    let match = req.query.info === "panel" ? {} : { is_deleted: false };
    let info = await Singer.findOne({ slug: req.params.slug }).populate({
      path: "songs",
      options: { sort: { createdAt: -1 } },
      match,
      populate: [
        {
          path: "category",
        },
        {
          path: "rates",
        },
        {
          path: "comments",
          match: { is_deleted: false, is_accept: true },
        },
      ],
    });

    console.log({
      singerInfo: {
        name: info.name,
        id: info._id,
        slug: info.slug,
        image: info.image,
        createdAt: this.convertDate(info.createdAt, "D MMMM YYYY"),
      },
      categories: await Category.find({ is_deleted: false }).sort({
        createdAt: -1,
      }),
      songs: info.songs.map((song) => ({
        id: song._id,
        name: song.name,
        nameEng: song.nameEng,
        slug: song.slug,
        image: song.image,
        music: song.music,
        desc: song.desc,
        is_deleted: song.is_deleted,
        rateAverage: this.calculateRate(song.rates),
        countComment: song.comments.length,
        visited: song.visited ? song.visited.length : 0,
        creators: song.creators,
        category: song.category.name,
        categoryId: song.category._id,
        createdAt: this.convertDate(song.createdAt, "D MMMM YYYY"),
      })),
    })
    return this.response({
      res,
      message: `${info.name} لیست آهنگ های`,
      data: {
        singerInfo: {
          name: info.name,
          id: info._id,
          slug: info.slug,
          image: info.image,
          createdAt: this.convertDate(info.createdAt, "D MMMM YYYY"),
        },
        categories: await Category.find({ is_deleted: false }).sort({
          createdAt: -1,
        }),
        songs: info.songs.map((song) => ({
          id: song._id,
          name: song.name,
          nameEng: song.nameEng,
          slug: song.slug,
          image: song.image,
          music: song.music,
          desc: song.desc,
          is_deleted: song.is_deleted,
          rateAverage: this.calculateRate(song.rates),
          countComment: song.comments.length,
          visited: song.visited ? song.visited.length : 0,
          creators: song.creators,
          category: song.category.name,
          categoryId: song.category._id,
          createdAt: this.convertDate(song.createdAt, "D MMMM YYYY"),
        })),
      },
    });
  }

  async getIp(req, res) {
    this.saveIp(req);

    return this.response({
      res,
      message: `your IP :`,
      data: this.getIPUser(),
    });
  }

  async main(req, res) {
    return this.response({
      res,
      message: "لیست ",
      data: {
        main: await this.getListSongs(30, { is_deleted: false }),
        slides: await this.getListSongs(12, {
          is_deleted: false,
          is_slide: true,
        }),
        specials: await this.getListSongs(12, {
          is_deleted: false,
          is_special: true,
        }),
      },
    });
  }

  async categories(req, res) {
    let categories = await Category.find({ is_deleted: false })
      .populate({
        path: "songs",
        match: { is_deleted: false },
        options: { sort: { createdAt: -1 } },
      })
      .sort({
        createdAt: -1,
      });

    return this.response({
      res,
      message: "لیست دسته بندی ها",
      data: categories.map((category) => ({
        id: category._id,
        name: category.name,
        nameEng: category.nameEng,
        slug: category.slug,
        count: category.songs.length,
      })),
    });
  }

  async categorySongs(req, res) {
    let data = [];
    let param = req.params.slug;
    console.log(param)
    if (param == "all") {
      data = await this.getListSongs(0, {
        is_deleted: false,
      });
    } else {

      let category = await Category.findOne({ slug: param })
        .populate({
          path: "songs",
          match: { is_deleted: false },
          options: {
            sort: { createdAt: -1 }, populate: [
              {
                path: "category",
              },
              {
                path: "rates",
              },
              {
                path: "comments",
                match: { is_deleted: false, is_accept: true },
              },
            ]
          },
        })
        .sort({
          createdAt: -1,
        });

     

      data = category.songs.map((song) => ({
        id: song._id,
        name: song.name,
        slug: song.slug,
        image: song.image,
        category: song.category.name,
        rateAverage: this.calculateRate(song.rates),
        countComment: song.comments.length,
        visited: song.visited ? song.visited.length : 0,
      }));
    }

    return this.response({
      res,
      message: `لیست آهنگ های دسته بندی ${param}`,
      data,
    });
  }

  async downloadMusic(req, res) {
    let song = await Song.findOne({ _id: req.query.id });
    res.download("public/" + song.music);
  }

  async saveComment(req, res) {
    let { parent, songId } = req.body;
    let searchIp = await this.searchIpToDB();
    const comment = new Comment({ ...req.body, ip: searchIp._id });
    await comment.save();
    await IPModel.updateOne(
      { _id: searchIp._id },
      { $push: { comments: comment._id } }
    );
    await Song.updateOne({ _id: songId }, { $push: { comments: comment._id } });

    if (parent !== null) {
      await Comment.updateOne(
        { _id: parent },
        { $push: { replies: comment._id } }
      );
    }
    return this.response({
      res,
      code: 201,
      message: "کامنت جدید با موفقیت ثبت شد",
    });
  }

  async saveRate(req, res) {
    let { rate, songId } = req.body;
    let searchIp = await this.searchIpToDB();
    let saveRate = new Rate({ ip: searchIp._id, rate, songId });
    await saveRate.save();
    await Song.updateOne({ _id: songId }, { $push: { rates: saveRate._id } });
    return this.response({
      res,
      code: 201,
      message: "امتیاز جدید با موفقیت ثبت شد",
      data:{rate}
    });
  }

  async getListSongs(limit, searchQuery) {
    let songs = await Song.find(searchQuery)
      .populate({
        path: "comments",
        match: { is_deleted: false, is_accept: true },
      })
      .populate({
        path: "category singers rates",
      })
      .sort({
        createdAt: -1,
      })
      .limit(limit);

    return songs.map((song) => {
      return {
        id: song._id,
        name: song.name,
        slug: song.slug,
        image: song.image,
        singer: song.singers[0]["name"],
        category: song.category.name,
        rateAverage: this.calculateRate(song.rates),
        countComment: song.comments.length,
        visited: song.visited ? song.visited.length : 0,
        createdAt: this.convertDate(song.createdAt, "D MMMM YYYY"),
      };
    });
  }

  async countComment(songId) {
    return await Comment.find({
      is_deleted: false,
      is_accept: true,
      songId,
    }).count();
  }

  async bestSong() {
    let bestSongs = await Rate.aggregate([
      { $group: { _id: "$songId", avg: { $avg: "$rate" } } },
      {
        $lookup: {
          from: "songs",
          localField: "_id",
          foreignField: "_id",
          as: "list",
        },
      },
      { $sort: { avg: -1 } },

      {
        $lookup: {
          from: "singers",
          localField: "list.singers",
          foreignField: "_id",
          as: "list2",
        },
      },
      { $limit: 10 },
    ]);

    return bestSongs.map((song) => ({
      id: song.list[0]._id,
      name: song.list[0].name,
      slug: song.list[0].slug,
      image: song.list[0].image,
      singer: song.list2[0].name,
    }));
  }

  async countCommentSong(songId) {
    return await Comment.find({ is_deleted: false, songId }).count();
  }

  calculateRate(rates) {
    let rateMidd =
      rates.length > 0
        ? rates.reduce((a, b) => a + b.rate, 0) / rates.length
        : 0;
    return Math.round(rateMidd * 10) / 10;
  }
})();

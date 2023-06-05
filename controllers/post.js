const Post = require("../models/post");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");

exports.getPostById = (req, res, next, id) => {
  Post.findById(id)
    .populate("postedBy", "_id name")
    .exec((err, post) => {
      if (err) {
        return res.status(400).json({
          err: "No POST Found",
        });
      }
      req.post = post;
      next();
    });
};

exports.create = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        err: "Problem with PHOTO",
      });
    }

    let post = new Post(fields);
    post.postedBy = req.profile;

    if (file.photo) {
      if (file.photo.size > 3000000) {
        return res.status(400).json({
          err: "File size too big",
        });
      }
      post.photo.data = fs.readFileSync(file.photo.filepath);
      post.photo.contentType = file.photo.mimetype;
    }
    console.log(post);

    post.save((err, post) => {
      if (err) {
        return res.status(400).json({
          err: "Saving photo in DB failed",
        });
      }
      res.json({
        ...post._doc,
      });
    });
  });
};

//middleware
exports.photo = (req, res, next) => {
  res.set("Content-Type", req.post.photo.contentType);
  return res.send(req.post.photo.data);
};

exports.deletePost = (req, res) => {
  let post = req.post;
  post.remove((err, deletedPost) => {
    if (err) {
      return res.status(400).json({
        err: "Failed to delete post",
      });
    }
    res.json({
      message: "Post Deleted Successfully",
      deletedPost,
    });
  });
};

exports.listByUser = async (req, res) => {
  try {
    let posts = await Post.find({ postedBy: req.profile._id })
      .populate("postedBy", "_id name")
      .sort("-created")
      .exec();
    res.json(posts);
  } catch (err) {
    return res.status(400).json({
      error: "SOMETHING WENT WRONG",
    });
  }
};

exports.listNewsFeed = async (req, res) => {
  let following = req.profile.following;
  following.push(req.profile._id);
  try {
    let posts = await Post.find({ postedBy: { $in: req.profile } })
      .populate("postedBy", "_id name")
      .sort("-created")
      .exec();
    res.json(posts);
  } catch (err) {
    return res.status(400).json({
      error: "NO POST TO SHOW",
    });
  }
};

exports.like = async (req, res) => {
  try {
    let result = await Post.findByIdAndUpdate(
      req.body.postId,
      { $push: { likes: req.body.userId } },
      { new: true }
    );
    res.json(result);
  } catch (err) {
    return res.status(400).json({
      error: "PoST NOT LIKED",
    });
  }
};

exports.unlike = async (req, res) => {
  try {
    let result = await Post.findByIdAndUpdate(
      req.body.postId,
      { $pull: { likes: req.body.userId } },
      { new: true }
    );
    res.json(result);
  } catch (err) {
    return res.status(400).json({
      error: "SOMETHING WENT WRONG",
    });
  }
};

exports.isPoster = (req, res, next) => {
  let isPoster = req.post && req.auth && req.post.postedBy._id == req.auth._id;
  if (!isPoster) {
    return res.status("403").json({
      error: "User is not authorized",
    });
  }
  next();
};

// exports.updatePost = (req, res) => {
//   let form = new formidable.IncomingForm();
//   form.keepExtensions = true;

//   form.parse(req, (err, fields, file) => {
//     if (err) {
//       return res.status(400).json({
//         err: "Problem with PHOTO",
//       });
//     }
//     const { description } = fields;

//     let post = req.post;
//     post = _.extend(post, fields);

//     if (file.photo) {
//       if (file.photo.size > 3000000) {
//         return res.status(400).json({
//           err: "File size too big",
//         });
//       }
//       post.photo.data = fs.readFileSync(file.photo.filepath);
//       post.photo.contentType = file.photo.mimetype;
//     }
//     console.log(post);

//     post.save((err, post) => {
//       if (err) {
//         return res.status(400).json({
//           err: "Updation of photo in DB failed",
//         });
//       }
//       res.json({
//         id: post._id,
//       });
//     });
//   });
// };

// exports.listNewsFeed = (req, res) => {
//   Post.find()
//     .select("-photo") //these - specify without photo we are getting posts
//     .sort([["updatedAt", "descending"]])
//     .exec((err, posts) => {
//       if (err) {
//         return res.status(400).json({
//           err: "NO POST in DB",
//         });
//       }
//       res.json(posts);
//     });
// };

// exports.getPost = (req, res, id) => {
//   req.post.photo = undefined;
//   return res.json(req.post);
// };

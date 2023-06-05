const User = require("../models/user");
const formidable = require("formidable");
const fs = require("fs");
var mongoose = require("mongoose");
const path = require("path");

const extend = require("lodash/extend");

exports.getUserById = (req, res, next, id) => {
  User.findById(id)
    .populate("following", "_id name")
    .populate("followers", "_id name")
    .exec((err, user) => {
      if (err || !user) {
        return res.status(400).json({
          err: "No user was found in DB",
        });
      }
      req.profile = user;
      next();
    });
};

exports.read = (req, res) => {
  req.profile.salt = undefined;
  req.profile.encry_password = undefined;
  return res.json(req.profile);
};

exports.getAllUser = (req, res) => {
  User.find()
    .select("name email updated created")
    .exec((err, user) => {
      if (err || !user) {
        return res.json({
          err: "NO USER FOUND",
        });
      }
      req.profile = user;
      return res.json(req.profile);
    });
};

exports.list = async (req, res) => {
  try {
    let users = await User.find().select("name email lives updated created");
    res.json(users);
  } catch (error) {
    return res.status(400).json({
      error: "NOT FOUND",
    });
  }
};

exports.update = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Photo could not be uploaded",
      });
    }
    let user = req.profile;
    user = extend(user, fields);
    user.updated = Date.now();
    if (files.photo) {
      user.photo.data = fs.readFileSync(files.photo.filepath);
      user.photo.contentType = files.photo.mimetype;
    }
    try {
      await user.save();
      user.encry_password = undefined;
      user.salt = undefined;
      res.json(user);
    } catch (error) {
      return res.status(400).json({
        error: "User NOT UPDATED",
      });
    }
  });
};

exports.remove = async (req, res) => {
  try {
    let user = req.profile;
    let deletedUser = await user.remove();
    deletedUser.hashed_password = undefined;
    deletedUser.salt = undefined;
    res.json(deletedUser);
  } catch (err) {
    return res.status(400).json({
      error: "USER NOT REMOVED",
    });
  }
};

//middleware
exports.photo = (req, res, next) => {
  if (req.profile.photo.data) {
    res.set("Content-Type", req.profile.photo.contentType);
    return res.send(req.profile.photo.data);
  }
  next();
};

// exports.defaultPhoto = (req, res) => {
//   return res.sendFile(process.cwd() + "/profileImage");
//   const profileImage = path.join(
//     __dirname,
//     "../controllers/assets/profile.png"
//   );
//     return res.sendFile(profileImagePath);
//   const filePath = path.join(process.cwd(), profileImage);
//   return res.sendFile(filePath);
//   return res.sendFile(process.cwd());
// };

exports.defaultPhoto = (req, res) => {
  const defaultPhotoPath = path.join(
    __dirname,
    "../controllers/assets/user.png"
  );
  return res.sendFile(defaultPhotoPath);
};

exports.addFollowing = async (req, res, next) => {
  try {
    console.log("HITIING");

    await User.findByIdAndUpdate(req.body.userId, {
      $push: { following: req.body.followId },
    });
    next();
  } catch (err) {
    return res.status(400).json({
      error: "User not followedddddddd",
    });
  }
};

exports.addFollower = async (req, res) => {
  console.log("HITIING FOLLOWER");

  try {
    console.log("HITIING Follower");

    let result = await User.findByIdAndUpdate(
      req.body.followId,
      { $push: { followers: req.body.userId } },
      { new: true }
    )
      .populate("following", "_id name")
      .populate("followers", "_id name")
      .exec();
    result.encry_password = undefined;
    result.salt = undefined;
    res.json(result);
  } catch (err) {
    return res.status(400).json({
      error: "User not followed",
    });
  }
};

exports.removeFollowing = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.body.userId, {
      $pull: { following: req.body.unfollowId },
    });
  } catch (err) {
    return res.status(400).json({
      error: "User not removeddd",
    });
  }
  next();
};
exports.removeFollower = async (req, res) => {
  try {
    let result = await User.findByIdAndUpdate(
      req.body.unfollowId,
      { $pull: { followers: req.body.userId } },
      { new: true }
    )
      .populate("following", "_id name")
      .populate("followers", "_id name")
      .exec();
    result.encry_password = undefined;
    result.salt = undefined;
    res.json(result);
  } catch (err) {
    return res.status(400).json({
      error: "User not removed",
    });
  }
};

exports.findPeople = async (req, res) => {
  let following = req.profile.following;
  following.push(req.profile._id);
  try {
    let users = await User.find({ _id: { $nin: following } }).select("name");
    res.json(users);
  } catch (err) {
    return res.status(400).json({
      error: "User not found",
    });
  }
};

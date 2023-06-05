const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema; //ObjectId is used for childSchema

const postSchema = new mongoose.Schema({
  photo: {
    data: Buffer,
    contentType: String,
  },
  text: {
    type: String,
    max: 500,
  },
  likes: [{ type: ObjectId, ref: "User" }],
  postedBy: { type: ObjectId, ref: "User" },
  created: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Post", postSchema);

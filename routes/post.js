const express = require("express");
const router = express.Router();

const {
  getPostById,
  create,
  getPost,
  photo,
  deletePost,
  updatePost,
  getAllPosts,
  listByUser,
  listNewsFeed,
  like,
  unlike,
} = require("../controllers/post");
const { getUserById } = require("../controllers/user");
const { isAuthenticated, isLoggedIn } = require("../controllers/auth");

router.param("userId", getUserById);
router.param("postId", getPostById);

//routes create post
router.post("/posts/new/:userId", isLoggedIn, create);
//middleware
router.get("/posts/photo/:postId", photo);

router.get("/posts/by/:userId", isLoggedIn, listByUser);

router.get("/posts/feed/:userId", isLoggedIn, listNewsFeed);
router.put("/posts/like", isLoggedIn, like);
router.put("/posts/unlike", isLoggedIn, unlike);

//delete post
router.delete("/posts/:postId", isLoggedIn, isAuthenticated, deletePost);

//update post
// router.put("/post/:postId/:userId", isLoggedIn, isAuthenticated, updatePost);

//get ALL user post
// router.get("/posts", isLoggedIn, getAllPosts);
module.exports = router;

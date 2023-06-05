const express = require("express");
const router = express.Router();

const {
  getUserById,
  getUser,
  getAllUser,
  read,
  list,
  update,
  remove,
  photo,
  defaultPhoto,
  findPeople,
  addFollowing,
  addFollower,
  removeFollowing,
  removeFollower,
  token,
} = require("../controllers/user");
const { isLoggedIn, isAuthenticated } = require("../controllers/auth");

router.param("userId", getUserById);
// router.get("/users", getAllUser);

router.get("/users", list);
// router.post("/users", create);

//fcmtoken
// router.post("/fcmtoken/:userId", token);

//followers
router.put("/users/follow", isLoggedIn, addFollowing, addFollower);
router.put("/users/unfollow", isLoggedIn, removeFollowing, removeFollower);

//findpeople
router.get("/users/findpeople/:userId", isLoggedIn, findPeople);

router.get("/users/:userId", isLoggedIn, read);

router.put("/users/:userId", isLoggedIn, isAuthenticated, update);
router.delete("/users/:userId", isLoggedIn, isAuthenticated, remove);

//photo middleware
router.get("/users/photo/:userId", photo);
// router.get("/users/defaultphoto/:userId", defaultPhoto);

// router.get("/users/defaultphoto", defaultPhoto);

module.exports = router;

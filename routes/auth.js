const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const {
  login,
  signup,
  logout,
  isSignedIn,
  isLoggedIn,
} = require("../controllers/auth");

router.post(
  "/signup",
  //data validation must go between route and controller
  [
    check("name", "Name should be atleast 3 charcter").isLength({
      min: 3,
    }),

    check("email", "Enter valid email").isEmail(),
    check("password", "Password should be atleast 5 charcter").isLength({
      min: 5,
    }),
  ],
  signup
);

router.post(
  "/login",
  //data validation must go between route and controller
  [
    check("email", "Email is required").isEmail(),
    check("password", "Password is required").isLength({
      min: 1,
    }),
  ],
  login
);

router.get("/logout", logout);

module.exports = router;

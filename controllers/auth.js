const User = require("../models/user");
const { validationResult } = require("express-validator");
// var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var { expressjwt: expressJwt } = require("express-jwt");
//jwt helps to create token ,cookie helps to put cookie
//in browser, expressJWT helps to keep you logged in

exports.signup = (req, res) => {
  //validation of data
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  }

  //to get wht user has type and saved it in db
  const user = new User(req.body);
  user.save((error, user) => {
    console.log(error);

    if (error) {
      return res.status(400).json({
        error: "Email already exist",
      });
    }

    res.json({
      name: user.name,
      id: user._id,
    });
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    //data validation
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        error: errors.array()[0].msg,
      });
    }

    //authentication
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({
        error: "Email does not exist",
      });
    }

    // const isMatch = await bcrypt.compare(password, user.password);

    if (!user.authenticate(password)) {
      return res.status(400).json({
        error: "Password does not match",
      });
    }

    //create token
    const token = jwt.sign({ _id: user._id }, process.env.SECRET);

    //put token in cookie in browser
    res.cookie("token", token, { expire: new Date() + 9999 });

    //send response to frontend
    const { _id, name, email, role } = user;
    return res.json({ token, user: { _id, name, email, role } });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      error: "Could not sign in",
    });
  }
};

exports.logout = (req, res) => {
  //clear cookie for logout
  res.clearCookie("token");
  res.json({
    message: "User logout successfully",
  });
};

//isloggedin is used when user want to see the post of friends
//but isauthenticate means user want to modify changes in acc

//protected routes
exports.isLoggedIn = expressJwt({
  secret: process.env.SECRET,
  userProperty: "auth",
  algorithms: ["HS256"],
});

//custom middleware
exports.isAuthenticated = (req, res, next) => {
  let checker = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!checker) {
    return res.status(403).json({
      error: "ACCESS DENIED",
    });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.profile.role === 0) {
    return res.status(403).json({
      error: "You are not ADMIN, ACCESS DENIED",
    });
  }
  next();
};

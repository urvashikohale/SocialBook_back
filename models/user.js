var mongoose = require("mongoose");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const { ObjectId } = mongoose.Schema; //ObjectId is used for childSchema

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 32,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: [true, "EMAIL required"],
    },
    //TODO PASSWORD
    encry_password: {
      type: String,
      required: true,
    },
    salt: String,
    //role is to diff user from admin

    updated: Date,
    created: {
      type: Date,
      default: Date.now,
    },
    about: {
      type: String,
      trim: true,
      default: "",
    },
    lives: { type: String, trim: true },
    photo: {
      data: Buffer,
      contentType: String,
    },
    fcmToken: [{ type: String }],
    following: [{ type: ObjectId, ref: "User" }],
    followers: [{ type: ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

//password hashing here
//Schema method from lco 30->06
//thapa technical mern 14
userSchema
  .virtual("password")
  .set(function (password) {
    this._password = password;
    this.salt = uuidv4();
    this.encry_password = this.securePassword(password);
  })
  .get(function () {
    return this._password;
  });

userSchema.methods = {
  authenticate: function (plainpassword) {
    return this.securePassword(plainpassword) === this.encry_password;
  },

  securePassword: function (plainpassword) {
    if (!plainpassword) return "";
    try {
      return crypto
        .createHmac("sha256", this.salt)
        .update(plainpassword)
        .digest("hex");
    } catch (err) {
      return "";
    }
  },

  // userSchema.pre("save", async function (next) {
  //   if (this.isModified("password")) {
  //     this.password = await bcrypt.hash(this.password, 12);
  //   }
  //   next();
  // })
};

module.exports = mongoose.model("User", userSchema);

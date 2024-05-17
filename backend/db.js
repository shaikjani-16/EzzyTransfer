import mongoose from "mongoose";
import jwt from "jsonwebtoken";
mongoose.connect(
  "mongodb+srv://mahaboobjanishaik2002:grB3DgmYU6QTye7I@cluster0.gotb86f.mongodb.net"
);
//user Schema
const user = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    minLength: 3,
    maxLength: 30,
  },
  password: { type: String, required: true, minLength: 6 },
  firstName: { type: String, required: true, trim: true, maxLength: 20 },
  lastName: { type: String, required: true, trim: true, maxLength: 20 },
});

user.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      userName: this.userName,
      firstName: this.firstName,
      lastName: this.lastName,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.TOKEN_EXPIRY_TIME }
  );
};

const User = mongoose.model("User", user);

// account schema

const accounSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  balance: {
    type: Number,
    required: true,
  },
});
const Account = mongoose.model("Account", accounSchema);
export { User, Account };

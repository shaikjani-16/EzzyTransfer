import { Router } from "express";
import { User, Account } from "../db.js";
import { z } from "zod";
import jwt from "jsonwebtoken";
import verifyJWT from "../utils/auth_middleware.js";
import { JWT_SECRET } from "../config.js";
const userRouter = Router();
//zod validation
const signUpSchema = z.object({
  userName: z.string().email("Incorrect email address"),
  password: z.string().min(8),
  firstName: z.string().min(4),
  lastName: z.string().min(4),
});
const signInSchema = z.object({
  userName: z.string().email("Incorrect email address"),
  password: z.string().min(8),
});
userRouter.post("/signup", async (req, res) => {
  console.log(req.body);
  const { userName, password, firstName, lastName } = req.body;
  const { success } = signUpSchema.safeParse(req.body);
  if (!success) {
    return res.json({ status: 401, message: "validation failed" });
  }
  const user = await User.findOne({ userName });
  if (user) {
    return res.json({ status: 411, message: "user already exists" });
  }
  const createUser = await User.create({
    userName,
    password,
    firstName,
    lastName,
  });
  const userId = createUser._id;
  if (createUser) {
    await Account.create({
      userId,
      balance: 1 + Math.random() * 10000,
    });
    const options = {
      httpOnly: true, // Ensures the cookie is only accessible via web server
      secure: process.env.NODE_ENV === "production", // Secure in production
      sameSite: "strict", // Helps prevent CSRF attacks
      maxAge: 3600000, // Optional: Set cookie expiry (1 hour in milliseconds)
    };

    const token = jwt.sign(
      {
        userId,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.TOKEN_EXPIRY_TIME }
    );

    return res.cookie("accessToken", token, options).json({
      message: "User created",
      token: token,
      status: 200,
    });
  }
  console.log(user);
});

userRouter.post("/signin", async (req, res) => {
  const { userName, password } = req.body;
  console.log(req.body);
  const { success } = signInSchema.safeParse(req.body);
  if (!success) {
    return res.json({ status: 401, message: "Incorrect format" });
  }
  const options = {
    httpOnly: true,
    secure: true,
  };
  const user = await User.findOne({ userName });
  if (user) {
    if (user.password == password) {
      const accessToken = await user.generateAccessToken();
      console.log(accessToken);

      res.cookie("accessToken", accessToken).json({
        message: "User signed in successfully",
        status: 200,
        token: accessToken,
      });
    } else {
      res.json({ status: 411, message: "Incorrect password" });
    }
  } else {
    res.json({ status: 411, message: "user not found" });
  }
});
userRouter.route("/logout").get(verifyJWT, async (req, res) => {
  await User.findById(req.user._id);
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res.status(200).clearCookie("accessToken", options).json({
    message: "User signed out successfully",
  });
});
userRouter.route("/update").put(verifyJWT, async (req, res) => {
  const updateBody = z.object({
    password: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  });
  const user = await User.findById(req.user._id);
  if (!user) return res.status(411).json({ message: "Please Login" });
  const { success } = updateBody.safeParse(req.body);
  if (!success) {
    res.status(411).json({
      message: "Error while updating information",
    });
  }
  const updated = await User.updateOne({ _id: user._id }, req.body);

  res.json({
    message: "Updated successfully",
    user: updated,
  });
});
userRouter.get("/getUsers", async (req, res) => {
  const filter = req.query.filter || "";

  const users = await User.find({
    $or: [
      {
        firstName: {
          $regex: filter,
        },
      },
      {
        lastName: {
          $regex: filter,
        },
      },
    ],
  });
  res.json({
    user: users.map((user) => ({
      userName: user.userName,
      firstName: user.firstName,
      lastName: user.lastName,
      _id: user._id,
    })),
  });
});
export { userRouter };

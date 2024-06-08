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
  // console.log(req.body);
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
      httpOnly: false, // Ensures the cookie is only accessible via web server
      secure: false, // Secure in production
      sameSite: "lax", // Helps prevent CSRF attacks
      maxAge: 3600000, // Optional: Set cookie expiry (1 hour in milliseconds)
    };

    const token = jwt.sign(
      {
        userId,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.TOKEN_EXPIRY_TIME }
    );

    return res.cookie("accessToken", token).json({
      message: "User created",
      token: token,
      status: 200,
      user: createUser,
    });
  }
  // console.log(user);
});

userRouter.post("/signin", async (req, res) => {
  const { userName, password } = req.body;
  // console.log(req.body);
  // console.log(req.cookies.accessToken);
  const { success } = signInSchema.safeParse(req.body);
  if (!success) {
    return res.json({ status: 401, message: "Incorrect format" });
  }
  // const options = {
  //   httpOnly: false, // Ensures the cookie is only accessible via web server
  //   secure: false, // Secure in production
  //   sameSite: "lax", // Helps prevent CSRF attacks
  //   maxAge: 3600000,
  // };
  const user = await User.findOne({ userName });
  if (user) {
    if (user.password == password) {
      const at = await user.generateAccessToken();
      // console.log(at);
      // console.log(accessToken);

      res
        .cookie("token", at, {
          httpOnly: true,
          expires: new Date(Date.now() + 99 * 99 * 99 * 60000),
        })
        .json({
          message: "User signed in successfully",
          user: user,
          status: 200,
          token: at,
        });
      // console.log(accessToken);

      // console.log(req.cookies?.accessToken);
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
    httpOnly: false, // Ensures the cookie is only accessible via web server
    secure: false, // Secure in production
    sameSite: "lax", // Helps prevent CSRF attacks
    maxAge: 3600000,
  };
  return res.status(200).clearCookie("accessToken").json({
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

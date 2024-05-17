import { Router } from "express";
import { User } from "../db.js";
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
  const { userName, password, firstName, lastName } = req.body;
  const { success } = signUpSchema.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "Incorrect signUp",
    });
  }
  const user = await User.findOne({ userName });
  if (user) {
    return res.status(411).json({
      message: "User already exists",
    });
  }
  const createUser = await User.create({
    userName,
    password,
    firstName,
    lastName,
  });
  const userId = createUser._id;
  if (createUser) {
    const token = jwt.sign(
      {
        userId,
      },
      JWT_SECRET
    );
    return res.status(201).json({
      message: "User created",
      token: token,
    });
  }
  console.log(user);
});

userRouter.get("/signin", async (req, res) => {
  const { userName, password } = req.body;
  const { success } = signInSchema.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "Incorrect signIn",
    });
  }
  const options = {
    httpOnly: true,
    secure: true,
  };
  const user = await User.findOne({ userName });
  if (user) {
    if (user.password == password) {
      const accessToken = await user.generateAccessToken();

      res.status(200).cookie("accessToken", accessToken, options).json({
        message: "User signed in successfully",
      });
    } else {
      res.status(411).json({
        message: "Incorrect password",
      });
    }
  } else {
    res.status(411).json({
      message: "user not found",
    });
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
        firsName: {
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

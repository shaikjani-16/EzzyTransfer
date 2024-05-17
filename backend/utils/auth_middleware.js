import jwt from "jsonwebtoken";
import { User } from "../db.js";
import Cookies from "cookies";

const verifyJWT = async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({
      message: "Please login",
    });
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded?._id).select("-password");
  if (!user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  req.user = user;
  next();
};

export default verifyJWT;

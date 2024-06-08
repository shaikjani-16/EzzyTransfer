import jwt from "jsonwebtoken";
import { User } from "../db.js";

const verifyJWT = async (req, res, next) => {
  // console.log(req.cookies?.accessToken);
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.json({ status: 411, message: "Please login" });
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded?._id || decoded?.userId).select(
    "-password"
  );
  if (!user) {
    return res.json({
      status: 411,
      message: "Unauthorized",
    });
  }
  req.user = user;
  next();
};

export default verifyJWT;

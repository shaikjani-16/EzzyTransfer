import express from "express";
import router from "./routes/index.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

const app = express();
app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());
app.use(cookieParser());
dotenv.config({
  path: "../.env",
});
app.use("/api/v1", router);
app.get("/", (req, res) => {
  res.send("Hi shaik");
});
app.listen(8000);

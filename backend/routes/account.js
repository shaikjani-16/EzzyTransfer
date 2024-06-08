import { Router } from "express";
import verifyJWT from "../utils/auth_middleware.js";
import { Account } from "../db.js";
import mongoose from "mongoose";
const accountRouter = Router();

accountRouter.route("/balance").get(verifyJWT, async (req, res) => {
  const userId = req.user._id;
  const account = await Account.findOne({ userId });
  res.json({ status: 200, balance: account?.balance });
});
accountRouter.route("/send").post(verifyJWT, async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const { amount, to } = req.body;

    // Fetch the accounts within the transaction
    const account = await Account.findOne({ userId: req.user._id }).session(
      session
    );

    if (!account || account.balance < amount) {
      await session.abortTransaction();
      return res.json({ status: 400, message: "Insufficient balance" });
    }

    const toAccount = await Account.findOne({ userId: to }).session(session);

    if (!toAccount) {
      await session.abortTransaction();
      return res.json({
        status: 400,
        message: "Invalid account",
      });
    }

    // Perform the transfer
    await Account.updateOne(
      { userId: req.user._id },
      { $inc: { balance: -amount } }
    ).session(session);
    await Account.updateOne(
      { userId: to },
      { $inc: { balance: amount } }
    ).session(session);

    // Commit the transaction
    await session.commitTransaction();
    res.json({
      status: 200,
      message: "Transfer successful",
    });
  } catch (error) {
    // Log the error details for debugging
    console.error("Transaction error:", error);

    // Abort the transaction
    await session.abortTransaction();

    // Send a generic error message to the client
    res.json({
      status: 500,
      message: "Transaction failed. Please try again later.",
    });
  } finally {
    session.endSession();
  }
});
export { accountRouter };

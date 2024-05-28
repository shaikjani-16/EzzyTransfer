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
accounSchema.methods.sendMoney = async function (amount, to) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const parsedAmount = parseInt(amount, 10);
    if (isNaN(parsedAmount)) {
      await session.abortTransaction();
      session.endSession();
      return { message: "Invalid amount" };
    }

    if (this.balance < parsedAmount) {
      await session.abortTransaction();
      session.endSession();
      return { message: "Insufficient Balance" };
    }

    const recipient = await Account.findOne({ userId: to }).session(session);

    if (!recipient) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Invalid account",
      });
    }

    const recipientBalance = parseInt(recipient.balance, 10);
    if (isNaN(recipientBalance)) {
      await session.abortTransaction();
      session.endSession();
      return { message: "Invalid recipient balance" };
    }

    recipient.balance += parsedAmount;
    this.balance -= parsedAmount;

    await recipient.save({ session });
    await this.save({ session });

    await session.commitTransaction();
    session.endSession();

    return { message: "Transfer successful" };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const Account = mongoose.model("Account", accounSchema);
export { User, Account };

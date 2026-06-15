import User from "../models/user.model.js";
import Admin from "../models/admin.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Try finding in User collection
  let account = await User.findOne({ email });
  let role = "user";

  // If not found in User, try Admin collection
  if (!account) {
    account = await Admin.findOne({ email });
    role = "admin";
  }

  if (account && (await bcrypt.compare(password, account.password))) {
    res.json({
      _id: account._id,
      name: account.name,
      email: account.email,
      role: account.role || role,
      std: account.std,
      token: generateToken(account._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

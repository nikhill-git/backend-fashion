const userModel = require("../models/users.model");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSignupController = async (req, res) => {
  try {
    const { name, email, password, interests } = req.body;
    if (!name || !email || !password || !interests) {
      return res.status(400).json({
        message: "Fields are missing",
      });
    }

    const isEmail = validator.isEmail(email);

    if (!isEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Not a valid email" });
    }

    const isPassword = validator.isStrongPassword(password);

    if (!isPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Not a strong password" });
    }

    const hash = await bcrypt.hash(password, 10);

    const userData = new userModel({
      name,
      email,
      password: hash,
      interests,
    });

    const user = await userData.save();

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: user,
    });
  } catch (err) {
    return res.status(400).json({
      message: err.message || "Oops something went wrong",
    });
  }
};

const userLoginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isUserExists = await userModel
      .findOne({ email: email })
      .select("+password");

    if (!isUserExists) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isPassword = bcrypt.compare(password, isUserExists.password);

    if (!isPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = await jwt.sign(
      { userId: isUserExists._id },
      process.env.JWT_SECRET_TOKEN,
    );

    res.cookie("token", token);

    return res.status(200).json({
      success: true,
      message: "credentials matched",
    });
  } catch (err) {
    return res
      .status(400)
      .json({
        success: false,
        message: err.message || "Oops something went wrong",
      });
  }
};

const userLogoutController = (req, res) => {
  try {
    res.cookie("token", null, {expires : new Date(Date.now())})
    return res.status(200).json({success : true, message : "logout successfull"})
  } catch (err) {
    return res
      .status(400)
      .json({
        success: false,
        message: err.message || "Oops something went wrong",
      });
  }
};

module.exports = {
  userSignupController,
  userLoginController,
  userLogoutController
};

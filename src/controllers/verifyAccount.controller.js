const { transporter } = require("../config/nodemailer");
const crypto = require("crypto");
const sendOtp = require("../helpers/sendOtp.helper");
const verifyOtp = require("../helpers/verifyOtp.helper");
const otpModel = require("../models/otp.model");

//use same api for resendin the OTP
const verifyAccountSendOtp = async (req, res) => {
  try {
    const { user } = req;

    if (user.isAccountVerified) {
      return res.status(400).json({
        success: false,
        message: "Account already verified",
      });
    }

    const isExists = await otpModel.findOne({
      user: user._id,
      purpose: "verifyAccount",
    });

    if (isExists && isExists.expiresAt - 3 * 60 * 1000 + 60000 > Date.now()) {
      return res.status(400).json({
        success: false,
        message: "wait for few seconds",
      });
    }

    const subject = "Verify your account";
    const text = `Use this OTP to verify your account. OTP expires in 3mins`;

    const result = await sendOtp(user.email, subject, text);

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }

    //check if exists before updating
    await otpModel.findOneAndUpdate(
      { user: user._id, purpose: "verifyAccount" },
      {
        otp: crypto.createHash("sha256").update(result.otp).digest("hex"),
        expiresAt: Date.now() + 3 * 60000,
      },
      { upsert: true, new: true },
    );

    return res.status(200).json({
      success: true,
      message: "OTP has been sent to your email successfully",
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Oops something went wrong",
    });
  }
};

const verifyAccountOtp = async (req, res) => {
  try {
    const { user } = req;
    const { userOTP } = req.body;

    if (!userOTP || userOTP.length !== 6) {
      return res.status(400).json({
        success: false,
        message: "OTP is not valid",
      });
    }

    const otpStored = await otpModel.findOne({user : user._id, purpose : "verifyAccount"})

    if(!otpStored){
      return res.status(400).json({
        success: false,
        message: "OTP expired. Resend OTP",
      });
    }

    const result = await verifyOtp(otpStored.otp, userOTP);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message || "Invalid OTP",
      });
    }

    user.isAccountVerified = true
    await user.save()

    await otpStored.deleteOne()

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (err) {
    return res.status(400).json({
      success : false,
      message : err.message || "Oops somwthing went wrong"
    });
  }
};

module.exports = {
  verifyAccountSendOtp,
  verifyAccountOtp,
};

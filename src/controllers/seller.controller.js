const { validateSellerSchema } = require("../helpers/validateSeller");
const sellerModel = require("../models/sellers.model");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const validateSellerUpdates = require("../helpers/validatesellerUpdateData");
const accountModel = require("../models/account.model");
const productModel = require("../models/product.model");
const sendOtp = require("../helpers/sendOtp.helper")
const verifyOtp = require("../helpers/verifyOtp.helper")
const otpModel = require('../models/otp.model')

const createSeller = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { user } = req;

    //validating the user and req.body
    if (!user.isAccountVerified || !user.isAccountActive) {
      return res.status(400).json({
        success: false,
        message: "Not a valid account",
      });
    }
    if (user._id.toString() !== req.body.seller || user.role === "seller") {
      return res.status(400).json({
        success: false,
        message: "not a valid seller id",
      });
    }
    const response = validateSellerSchema.safeParse(req.body);
    if (!response.success) {
      return res.status(400).json({
        success: false,
        message: response.error.message || "Oops something went wrong",
      });
    }

    session.startTransaction();

    //edge cases
    const isAlreadySeller = await sellerModel.findOne(
      {
        seller: req.body.seller,
      },
      { session },
    );
    if (isAlreadySeller) {
      return res.status(400).json({
        success: false,
        message: "Seller account alreadu exists",
      });
    }

    //when we pass session, it only accepts array like syntax
    const [seller] = await sellerModel.create([response.data], { session });
    user.role = "seller";
    await user.save({ session });

    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: "seller doc has been successfully created",
      data: seller,
    });
  } catch (err) {
    //abortTransaction only if the transaction has been started
    if (session.inTransaction) {
      session.abortTransaction();
    }
    return res.status(400).json({
      success: false,
      message: err.message || "Oops something went wrong",
    });
  } finally {
    session.endSession();
  }
};

const updateSeller = async (req, res) => {
  try {
    const { user } = req;
    const userData = req.body;

    const VALID_UPDATES = ["storeName", "category", "address", "contact"];

    const isUpdateValid = Object.keys(userData).forEach((key) =>
      VALID_UPDATES.includes(key),
    );

    if (!isUpdateValid) {
      return res.status(400).json({
        success: false,
        message: "Invlaid updates",
      });
    }

    const response = validateSellerUpdates.safeParse(userData);

    if (!response.success) {
      return res.status(400).json({
        success: false,
        message:
          response.error.issues.map((err) => err.message).join(", ") ||
          "Invalid Data",
      });
    }

    const updatedUser = await accountModel.findByIdAndUpdate(
      user._id,
      userData,
      { new: true },
    );

    if (!updatedUser) {
      return res.status(400).json({
        success: false,
        message: "Oops something went wrong",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Something wentt wrong",
    });
  }
};

//the seller himself want to unactivate his account
//same api for resending the otp
const unactivateSeller = async (req, res) => {
  try {
    const { user } = req;
    const { sellerId } = req.body;

    //rate limiting
    const alreadySent = await otpModel.findOne({user : user._id, purpose : "deactivateSeller"})
    if(alreadySent && alreadySent.expiresAt - (3* 60 * 1000) + 60000 < Date.now()){
      return res.status(400).json({
        success: false,
        message: "Seller doesnt exists",
      });
    }


    const isSeller = await sellerModel.findById(sellerId);
    if (!isSeller) {
      return res.status(404).json({
        success: false,
        message: "Seller doesnt exists",
      });
    }
    if(isSeller.status === "unactive" || isSeller.status === "block" || isSeller.status === "pending"){
      return res.status(400).json({
        success : false,
        message : "You cant Unactivate this seller account"
      })
    }
    if (
      user._id.toString() !== isSeller.seller.toString() ||
      user.role !== "seller"
    ) {
      return res.status(400).json({
        success: false,
        message: "Youre not a authorized user",
      });
    }
    
    if(isSeller.balanceAmount > 0){
      return res.status(400).json({
        success : false,
        message : "You cant deactivate your seller account, if balanceAmount is greater than Zero"
      })
    }

    //sending otp for bussinessEmail for verification
    const subject = "Verification for deactivating your seller acccount"
    const text = "Use this Otp to deactivate your account. And you only activate this account after 14 days. This otp expires in 3mins"
    const response = await sendOtp(isSeller.bussinessEmail, subject, text)
    
    if(!response.success){
      return res.status(400).json({
        success: false,
        message: response.message || "Oops something went wrong, try again",
      });
    }
    
    await otpModel.findOneAndUpdate(
      {user : user._id, purpose : "deactivateSeller"},
      {
        otp : crypto.createHash("sha256").update(response.otp).digest("hex"),
        expiresAt : Date.now() + 3 * 60000
      },
      {upsert : true, new : true}
    )
    
    return res.status(200).json({
      success: true,
      message: `OTP has been successfully sent to ${isSeller.bussinessEmail}.Otp expires in 3mins`
    });
    
    
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Oops something went wrong",
    });
  }
};

const unactivateSellerVerification = async(req, res) => {
  const session = await mongoose.startSession()
  try{
    //verify otp
    const {user} = req
    const {otp, sellerId} = req.body

    //verify the seller
    const isSeller = await sellerModel.findById(sellerId);
    if (!isSeller) {
      return res.status(404).json({
        success: false,
        message: "Seller doesnt exists",
      });
    }
    if (
      user._id.toString() !== isSeller.seller.toString() ||
      user.role !== "seller"
    ) {
      return res.status(400).json({
        success: false,
        message: "Youre not a authorized user",
      });
    }

    //verify the otp

    if(!otp || otp.toString().length !== 6){
      return res.status(400).json({
        success : false,
        message : "not a valid otp"
      })
    }

    const isOtpSent = await otpModel.findOne({user : user._id, purpose : "deactivateSeller"})
    if(!isOtpSent){
      return res.status(400).json({
        success: false,
        message: "Not a valid opt",
      })
    }
    
    let userOtp = String(otp).trim()
    const response = await verifyOtp(isOtpSent.otp, userOtp)
    
    if(!response.success){
      return res.status(400).json({
        success: false,
        message: response.message,
      })
    }
    //start a transaction
    session.startTransaction()
    await isOtpSent.deleteOne({session})

    //stopping all sellers products()
    const stoppedProducts = await productModel.updateMany(
      {sellerId : sellerId},
      {$set : {delivarable : false}},
      {session}
    )
    //unactivate
    isSeller.status = "unactive"

    await isSeller.save({session})

    session.commitTransaction()

    //send emails for both user's email and bussiness email
    //if any error occures it should not affect the response 
    try{
      await sendOtp(user.email, subject, text);
      await sendOtp(isSeller.bussinessEmail, subject, text);
    }
    catch(err){
      console.log(err.message || "Something went wrong while sending email")
    }

    return res.status(200).json({
      success : true,
      message : "Your account has been successfully deactivated. Your products willnot be available for users"
    })

  }
  catch(err){
    if(session.inTransaction){
      session.abortTransaction()
    }
    return res.status(400).json({
      success : false,
      message : err.message || "Something went wrong"
    })
  }
  finally{
    session.endSession()
  }
}

const activateSeller = async (req, res) => {};

// admin will block the seller
const blockSeller = async (req, res) => {};

module.exports = {
  createSeller,
  updateSeller,
};
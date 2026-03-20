const { validateSellerSchema } = require("../helpers/validateSeller");
const sellerModel = require("../models/sellers.model");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const validateSellerUpdates = require("../helpers/validatesellerUpdateData");
const accountModel = require("../models/account.model");

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
const unactivateSeller = async (req, res) => {
  try {
    const { user } = req;
    const { sellerId } = req.body;

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
    
    //unactivate
    //stopping all sellers products()
    //sending email for both seller's email and bussinessEmail
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Oops something went wrong",
    });
  }
};

const activateSeller = async (req, res) => {};

// admin will block the seller
const blockSeller = async (req, res) => {};

module.exports = {
  createSeller,
  updateSeller,
};

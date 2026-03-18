const mongoose = require("mongoose");

const sellersSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "accounts",
      required: true,
    },
    storeName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["active", "pending", "suspended"],
        message: "Not a valid status",
      },
      default: "pending",
    },
    category: {
      type: String,
      required: true,
    },
    bussinessEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    address: {
      street: String,
      city: String,
      pincode: Number,
      country: String,
    },
    contact: {
      type: Number,
      required: true,
    },
    taxPerProduct: {
      type: Number,
      required: true,
    },
    totalSales: {
      type: Number,
      required: true,
      default: 0,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("sellers", sellersSchema)

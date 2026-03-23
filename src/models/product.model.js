const mongoose = require("mongoose");


const productSchema = new mongoose.Schema(
  {
    sellerId : {
      type : mongoose.Schema.Types.ObjectId,
      ref : "sellers",
      required : true
    },
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    discountPercentage: {
      type: Number,
      required: true,
      default : 0.0
    },
    quantity : {
      type : Number,
      required : true,
      default : 1
    },
    image: {
      type: String,
      required: true,
    },
    delivarable : {
      type : Boolean,
      default : true
    }
  },
  { timestamps: true },
);

module.exports = mongoose.model("products", productSchema);

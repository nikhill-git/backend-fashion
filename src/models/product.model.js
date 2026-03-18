const mongoose = require("mongoose");


const productSchema = mongoose.Schema(
  {
    sellersId : {
      type : mongoose.Schema.Types.ObjectId,
      ref : "accounts",
      required : true
    },
    title: {
      type: String,
      required: true,
    },
    price: {
      typr: Number,
      required: true,
      min: 0,
    },
    category: {
      typr: String,
      required: true,
    },
    brand: {
      type: String,
      required: type,
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
  },
  { timestamps: true },
);

module.exports = mongoose.model("products", productSchema);

const productModel = require("../models/products.model");
const cartModel = require("../models/cart.model");

const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity = 1 } = req.body;
    const user = req.user;

    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    //if prodduct already exists just increment the quantity
    const cart = await cartModel.findOneAndUpdate(
      { user_id: user._id, "items.product_id": productId },
      { $inc: { "items.$.quantity": quantity } },
      { new: true },
    );

    if (!cart) {
      //if the user is entering for the first time, it will create a new document for that user
      const finalCart = await cartModel.findOneAndUpdate(
        { user_id: user._id },
        { $push: { items: { productId: productId, quantity } } },
        { upsert: true, new: true },
      );
      return res.status(200).json({
        success: true,
        message: "product successfully added to cart",
        cart: finalCart,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Product already exists just incremented the quantity",
      cart: cart.items,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Oops something went wrong",
    });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = req.user;

    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "product not found",
      });
    }

    const removeProduct = await productModel.findOneAndDelete(
      { user_id: user._id, "items.protuct_id": productId },
      { $pull: { items: { product_id: productId } } },
      { new: true },
    );

    if (!removeFromCart) {
      return res.status(404).json({
        success: false,
        message: "product does not exists in the cart",
      });
    }

    return res.status(200).json({
      success: true,
      message: "product successfully deleted from the cart",
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Oops something went wrong",
    });
  }
};

const clearCart = async (req, res) => {
  try {
    const { user } = req;

    const cart = await cartModel.findOneAndDelete(
      {user_id : user._id},
      { $set: { items: [], totalPrice: 0 } },
      { new: true },
    );

    if(!cart){
      return res.status(404).json({
      success: false,
      message: "cart does not exists",
      cart: cart,
    });
    }

    return res.status(200).json({
      success: true,
      message: "Cart cleared",
      cart: cart,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Oops something went wrong",
    });
  }
};

module.exports = {
  addToCart,
  removeFromCart,
  clearCart,
};

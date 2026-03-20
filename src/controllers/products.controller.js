const sellersModel = require("../models/sellers.model");
const validateProduct = require("../helpers/validateProduct");
const productModel = require("../models/product.model");

const addProducts = async (req, res) => {
  try {
    const { user } = req;

    const { sellerId, totalProducts, products, bussinessEmail } = req.body;

    const isSeller = await sellersModel.findById(sellerId);

    if (!isSeller) {
      return res.status(400).json({
        success: false,
        message: "Seller doesnt exists",
      });
    }

    if (isSeller.seller.toString() !== user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You are not authorized",
      });
    }

    if (!totalProducts || !products.length) {
      return res.status(400).json({
        success: false,
        message: "Required feilds are missing",
      });
    }

    if (isSeller.bussinessEmail !== bussinessEmail) {
      return res.status(400).json({
        success: false,
        message: "Not a valid bussinessEmail",
      });
    }

    if (totalProducts !== products.length) {
      return res.status(400).json({
        success: false,
        message: "Misinformation",
      });
    }

    let totalPrice = 0;
    let tax = 0;
    products.forEach((val) => {
      totalPrice += val.price * val.quantity;
      tax += val.quantity * 50;
    });

    let validProducts = [];
    let inValidProducts = [];

    for (const prod of products) {
      try {
        validateProduct(prod);
        validProducts.push(prod);
      } catch (err) {
        inValidProducts.push({
          product: prod,
          message: err.message || "Not a valid product",
        });
      }
    }

    //inplement acid

    const insertedProds = await productModel.insertMany(validProducts, {
      ordered: false,
    });

    if (!insertedProds) {
      return res.status(400).json({
        success: false,
        message: "Oops something went wrong",
      });
    }
    return res.status(200).json({
      success: true,
      message: insertedProds.length
        ? `${insertedProds.length} prods add to db successfully`
        : "Zero prods added",
      inValidProducts: inValidProducts,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Oops something went wrong",
    });
  }
};

const deleteProducts = async (req, res) => {
  try {
    const {user} = req

    const {productIds, sellerId, } = req.body

    const isSeller = await sellersModel.findById(sellerId)

    if(!isSeller){
      return res.status(400).json({
        success : false,
        messsage : "Invalid sellerId, seller not found"
      })
    }
    
    if(isSeller.seller.toString() !== user._id.toString()){
      return res.status(400).json({
        success : false,
        messsage : "Invalid sellerId, seller not found"
      })
    }

    //validate prods && seller of that prods
    let validProductIds = await productModel.find({_id : {$in : productIds}, sellerId : sellerId}).select("_id")

    validProductIds = validProductIds.map((val) => val.toString())

    let invalidProductIds = productIds.filter((val) => !validProductIds.includes(val.toString()))

    //optimize this futher on only deleting, using category, sellereProducts(model) 
    const deletedProds = await productModel.deleteMany({_id : {$in : validProductIds}})
    return res.status(200).json({
      success : true,
      message : `${deletedProds.deletedCount} has been successfully deleted`,
      invalidProducts : invalidProductIds
    })
    
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Oops something went wrong",
    });
  }
};

const getProducts = async(req, res) => {
  try{
    
  }
  catch(err){
    return res.status(400).json({
      success : false,
      message : err.message || "Oops something went wrong"
    })
  }
}

module.exports = {
  addProducts,
  deleteProducts,
  getProducts
};

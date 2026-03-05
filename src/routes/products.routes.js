const express = require("express")

const router = express.Router()

const userAuthMiddleware = require("../middlewares/userAuth.middleware")
const productsController = require("../controllers/products.controller")


router.get("/getProducts", userAuthMiddleware, productsController.getProducts)
router.get("/productInfo/:productId", userAuthMiddleware, productsController.productInfo)
router.get("/getcategoryWiseProducts/:category", userAuthMiddleware, productsController.getCategoryWiseProducts)
router.get("/getBrandWiseProducts/:brand", userAuthMiddleware, productsController.getProductsBybrand)


module.exports = router


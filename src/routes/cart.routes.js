const express = require("express")

const router = express.Router()

const userAuthMiddleware = require("../middlewares/userAuth.middleware")
const cartController = require("../controllers/cart.controller")
router.post("/add-to-cart/:productId", userAuthMiddleware, cartController.addToCart)
router.post("/remove-from-cart/:productId", userAuthMiddleware, cartController.removeFromCart)
router.get("/clearCart", userAuthMiddleware, cartController.clearCart)

module.exports = router
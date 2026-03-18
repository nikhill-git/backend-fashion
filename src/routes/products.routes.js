const express = require("express")

const router = express.Router()

const {authenticate} = require("../middlewares/authenticate.middleware")
const {authorize} = require("../middlewares/authorize.middleware")
const productsController = require("../controllers/products.controller")
router.post("/addProducts", authenticate, authorize("seller"), productsController.addProducts)

module.exports = router
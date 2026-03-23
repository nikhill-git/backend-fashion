const express = require("express")

const router = express.Router()

const {authenticate} = require("../middlewares/authenticate.middleware")
const {authorize} = require("../middlewares/authorize.middleware")
const productsController = require("../controllers/products.controller")

router.get("/getProducts", authenticate, productsController.getProducts)
router.post("/addProducts", authenticate, authorize("seller"), productsController.addProducts)
router.delete("/deleteProducts", authenticate, authorize("seller"), productsController.deleteProducts)
router.patch("/updateProduct", authenticate, authorize("seller", "developer"), productsController.updateProducts)
module.exports = router
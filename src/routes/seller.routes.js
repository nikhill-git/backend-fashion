const express = require("express")

const router = express.Router()

const {authenticate} = require("../middlewares/authenticate.middleware")
const sellerControllers = require("../controllers/seller.controller")

router.post("/createSeller", authenticate, sellerControllers.createSeller)
router.post("/updateSeller", authenticate, sellerControllers.updateSeller)

module.exports = router
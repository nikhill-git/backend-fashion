const express = require("express")

const router = express.Router()

const authController = require("../controllers/userAuth.controller")
router.post("/signup", authController.userSignupController)

module.exports = router 
const express = require("express")

const router = express.Router()

const authController = require("../controllers/userAuth.controller")

router.post("/signup", authController.userSignupController)
router.post("/login", authController.userLoginController)
router.post("/logout", authController.userLogoutController)


module.exports = router 
const {Router} = require("express")
const router = Router()

const userAuthControllers = require("../controllers/userAuth.controller.js")

router.post("/signup", userAuthControllers.signupController)
router.post("/login", userAuthControllers.loginController)
router.post("/logout", userAuthControllers.logoutController)

module.exports = router
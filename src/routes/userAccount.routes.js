const express = require("express");

const router = express.Router();

const { authenticate } = require("../middlewares/authenticate.middleware.js");

const verifyAccountControllers = require("../controllers/verifyAccount.controller.js");
router.post(
  "/verifyAccount/sendOtp",
  authenticate,
  verifyAccountControllers.verifyAccountSendOtp,
);
router.post(
  "/verifyAccount/verifyOtp",
  authenticate,
  verifyAccountControllers.verifyAccountOtp,
);


const userAccountControllers = require("../controllers/userAccount.controller.js")
router.post("/updatePassword", authenticate, userAccountControllers.updatePassword)
router.get("/getUser", authenticate, userAccountControllers.getUser)
router.delete("/deleteUserSendOtp", authenticate, userAccountControllers.deleteUserSendOtp)
router.delete("/deleteUserVerifyOtp", authenticate, userAccountControllers.deleteUserVerifyOtp)

const forgotPasswordControllers = require("../controllers/forgotPassword.controller.js");
router.post(
  "/forgotPassword/sendOtp",
  forgotPasswordControllers.forgotPassSendOtp,
);
router.post(
  "/forgotPassword/verifyOtp",
  forgotPasswordControllers.forgotPassVerifyOtp,
);
router.post(
  "/forgotPassword/resetPassword",
  forgotPasswordControllers.verifyAndResetPassword,
);

module.exports = router;

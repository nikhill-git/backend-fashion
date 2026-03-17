const express = require("express");

const router = express.Router();

const { userAuthMiddleware } = require("../middlewares/userAuth.middleware.js");

const verifyAccountControllers = require("../controllers/verifyAccount.controller.js");
router.post(
  "/verifyAccount/sendOtp",
  userAuthMiddleware,
  verifyAccountControllers.verifyAccountSendOtp,
);
router.post(
  "/verifyAccount/verifyOtp",
  userAuthMiddleware,
  verifyAccountControllers.verifyAccountOtp,
);


const userAccountControllers = require("../controllers/userAccount.controller.js")
router.post("/updatePassword", userAuthMiddleware, userAccountControllers.updatePassword)
router.get("/getUser", userAuthMiddleware, userAccountControllers.getUser)
router.delete("/deleteUser", userAuthMiddleware, userAccountControllers.deleteUser)
router.patch("/editUser", userAuthMiddleware, userAccountControllers.editUser)

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

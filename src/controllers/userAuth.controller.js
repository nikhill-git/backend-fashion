const { email } = require("zod");
const {validateUserSchema} = require("../helpers/validateUser.js")
const accountModel = require("../models/account.model.js")
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')
const {transporter} = require("../config/nodemailer.js")

const signupController = async (req, res, next) => {
  try {
    const { data, success, error } = validateUserSchema.safeParse(req.body);

    if (!success) {
      return res
        .status(400)
        .json({ success: false, message: "ERROR :" + error.message });
    }

    const userData = data;
    userData.password = await bcrypt.hash(req.body.password, 10);

    const newUser = await accountModel.create(userData);

    const jwtToken = jwt.sign({userId : newUser._id} , process.env.JWT_TOKEN)

    res.cookie("token", jwtToken, {
      httpOnly : true,
      secure : process.env.NODE_ENV === 'production',
      sameSite : process.env.NODE_ENV = "production" ? "none" : "strict"
    })

    const mailOptions = {
      from : process.env.SENDER_EMAIL,
      to : req.body.email,
      subject : "Welcome to Fashion Website",
      text : `Welcome to our fashion web. Your account has been created wilth email : ${req.body.email}.`
    }

    const sendMail = async() => {
      try{
        await transporter.sendMail(mailOptions)
      }
      catch(err){
        console.log(err.message)
      }
    }
    sendMail()

    return res.status(201).json({
      success: true,
      message: "New user created successfully",
      data: newUser,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || "Oops something went wrong",
    });
  }
};

const loginController = async (req, res) => {
  try {
    const {email, password} = req.body 
    if(!email || !password){
      return res.status(400).json({success : false, message : "Invalid credentials"})
    }
    
    const user = await accountModel.findOne({email : email}).select("+password")
    if(!user){
      return res.status(404).json({success : false, message : "User not found"})
    }
    
    const isPassword = await bcrypt.compare(password, user.password)
    
    if(!isPassword){
      return res.status(400).json({success : false, message : "Invalid credentials"})
    }

    const jwtToken = jwt.sign({userId : user._id} , process.env.JWT_TOKEN)

    res.cookie("token", jwtToken, {
      httpOnly : true,
      secure : process.env.NODE_ENV === "production",
      sameSite : process.env.NODE_ENV === "production" ? "none" : "strict"
    })
    
    return res.status(200).json({success : true, message : "credentials matched!, login successfull"})
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || "Oops something went wrong",
    });
  }
};

const logoutController = async(req, res) => {
  try{
    res.clearCookie("token", {
      httpOnly : true,
      secure : process.env.NODE_ENV === "production",
      sameSite : process.env.NODE_ENV === "production"? "none" : "strict"
    })
    res.status(200).json({success : true, message : "Logout successfull."})
  }
  catch(err){
    res.status(400).json({
      success: false,
      message: err.message || "Oops something went wrong",
    });
  }
}


module.exports = {
  signupController,
  loginController,
  logoutController
};

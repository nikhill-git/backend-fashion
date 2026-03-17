const crypto = require("crypto")
const {transporter} = require("../config/nodemailer")
const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const validator = require("validator")
const sendOtp = require("../helpers/sendOtp.helper")
const verifyOtp = require("../helpers/verifyOtp.helper")
const otpModel = require("../models/otp.model")

const forgotPassSendOtp = async(req, res) => {
    try {
        const {email} = req.body
        if(!email){
            return res.status(400).json({success : false, message : "Email is required"})
        }
        
        const user = await userModel.findOne({email : email})
        if(!user){
            return res.status(404).json({success : false, message : "User not found"})
        }

        const otpStored = await otpModel.findOne({user : user._id, purpose : 'resetPassword'})
        if(otpStored && (otpStored.expiresAt - (3 * 60 * 1000) + 60000) > Date.now()){
            return res.status(429).json({success : false, message : "Too many requests. wait for few seconds and try again"})
        }


        const subject = "Verification for forgot password"
        const text = "Use this OTP for verification reset your password. OTP expires in 3mins"

        const result = await sendOtp(email, subject, text )
        if(!result.success){
            return res.status(400).json({
                success : false,
                message : result.message
            })
        }

        await otpModel.findOneAndUpdate({
            user : user._id,
            purpose : "resetPassword"
        }, {
            otp :  crypto.createHash("sha256").update(result.otp).digest("hex"),
            expiresAt :  Date.now() + (3 * 60 * 1000)
        }, {
            upsert : true, new : true
        })

        return res.status(200).json({success : true, message : "OTP has been sent to your email successfully"})

    }
    catch(err){
        return res.status(400).json({
            success : false,
            message : err.message || "Oops something went wrong"
        })
    }
}

const forgotPassVerifyOtp = async(req, res) => {
    try{
        const ip = req.ip
        const {email, OTP} = req.body

        if(!email || !OTP){
            return res.status(400).json({
                success : false,
                message : "missing required credentials"
            })
        }
        
        const user = await userModel.findOne({email : email})
        if(!user){
            return res.status(404).json({
                success : false,
                message : "User not found"
            })
        }

        const otpStored = await otpModel.findOne({user : user._id, purpose : "resetPassword"})
        if(!otpStored){
            return res.status(400).json({
                success : false,
                message : "OTP expired resend OTP and try again"
            })
        }

        
        if(OTP.length !== 6){
            return res.status(400).json({
                success : false,
                message : "Invalid OTP"
            })
        }
        
        let cleanOTP = String(OTP).trim()
        const response = await verifyOtp(otpStored.otp, cleanOTP)
        
        if(!response.success){
            return res.status(400).json({
                success : false,
                message :  response.message || "Invalid OTP"
            })
        }

        await otpStored.deleteOne()
        
        await user.save()
        
        //generate a jwt token
        const token = jwt.sign({userId : user._id ,ip : ip,  purpose : "reset-password"}, process.env.JWT_TOKEN_FORGOT_PASSWORD, {expiresIn : "3m"})

        
        return res.status(200).json({
            success : true,
            message : "OTP verified successfully",
            jwtToken : token
        })

    }
    catch(err){
        return res.status(400).json({
            success : false,
            message : err.message || "Oops something went wrong"
        })
    }
}

const verifyAndResetPassword = async(req, res) => {
    try{
        const ip = req.ip
        const {token, password} = req.body
        if(!token || !password){
            return res.status(400).json({
                success : false,
                message : "required values are missings"
            })
        }
        
        const decoded = jwt.verify(token, process.env.JWT_TOKEN_FORGOT_PASSWORD)
        
        
        const user = await userModel.findById(decoded.userId)
        
        if(!user || decoded.purpose !== "reset-password"){
            return res.status(401).json({
                success : false,
                message : "Unaunthenticated"
            })
        }

        //if token is hijacked, this will check the ip or requested user and the ip of this user
        if(ip !== decoded.ip){
            return res.status(403).json({
                success : false,
                message : "Someone else is trying to change password, make sure that you are trying to reset password form a single device"
            })
        }
        
        //for the first time this condition fails, and for the second time with same token this coode gets executed
        if(user.passwordChangedAt && (user.passwordChangedAt.getTime()/1000) > decoded.iat){
            return res.status(401).json({
                success : false,
                message : "Password has been already changed"
            })
        }
        

        if(!validator.isStrongPassword(password)){ 
            return res.status(400).json({success : false, message : "Not a valid password"})
        }

        user.password = await bcrypt.hash(password, 10)
        user.passwordChangedAt = Date.now()
        await user.save()

        return res.status(200).json({
            success : true, 
            message : "reset password has been successfully completed"
        })  
        
    }
    catch(err){
        return res.status(400).json({
            success : false,
            message : err.message || "Oops something went wrong"
        })
    }
}

module.exports = 
{
    forgotPassSendOtp, 
    forgotPassVerifyOtp,
    verifyAndResetPassword
}
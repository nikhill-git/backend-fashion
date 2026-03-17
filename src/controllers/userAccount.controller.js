const bcrypt = require("bcrypt")
const validator = require("validator")
const userModel = require("../models/user.model")
const sendOtp = require("../helpers/sendOtp.helper.js")
const verifyOtp = require("../helpers/verifyOtp.helper.js")
const otpModel = require("../models/otp.model.js")
const crypto = require("crypto")


const updatePassword = async(req, res) => {
    try{
        const {currPassword, newPassword} = req.body
        if(typeof currPassword !== "string" || typeof newPassword !== "string"){
            return res.status(403).json({success : false, message : "Invaldi input format"})
        }
        if(currPassword === newPassword){
            return res.status(403).json({success : false, message : "Both currPassword and newPassword are same"})
        }
        const user = await userModel.findById(req.user._id).select("+password")
    
        if(!currPassword || !newPassword){
            return res.status(400).json({
                success : false,
                message : "Required feilds are missing"
            })
        }
        
        const isCurrPassword = await bcrypt.compare(currPassword, user.password) 
        if(!isCurrPassword){
            return res.status(400).json({
                success : false,
                message : "Current password is not correct"
            })
        }
        
        const isNewPasswordValid = validator.isStrongPassword(newPassword)
        
        if(!isNewPasswordValid){
            return res.status(400).json({
                success : false,
                message : "New password is not strong"
            })
        }
        
        user.password = await bcrypt.hash(newPassword, 10)
        await user.save()
        
        return res.status(200).json({
            success : true,
            message : "New password updated successfully"
        })

    }
    catch(err){
        return res.status(400).json({
            success : false,
            message : err.message || "Oops something went wrong"
        })
    }
}

const getUser = (req, res) => {
    try{
        return res.status(200).json({
            success : true,
            user : req.user
        })
    }
    catch(err){
        return res.status(400).json({success : false, message : "Oops something went wrong"})
    }
}

const deleteUserSendOtp = async(req, res) => {
    try{

        const {user} = req;

        const otpStored = await otpModel.findOne({user : user._id, purpose : "deleteAccount"})
        if(otpStored && (otpStored.expiresAt - (3 * 60 * 1000) + 60000) > Date.now()){
            return res.status(429).json({
                success : true,
                message : "Too many requests. Wait for few seconds and try again"
            }) 
        }

        const subject = "Verification for deleting yoour account"
        const text = "Use this OTP to delete yoour account, once deleted your data cant be retrived. OTP expires in 3 mins"

        const response = await sendOtp(user.email, subject, text)
        if(!response.success){
            return res.status(204).json({
                success : true,
                message : response.message || "Oops something went wrong"
            }) 
        }

        await otpModel.findOneAndUpdate({
            user : user._id, 
            purpose : "deleteAccount"
        }, {
            otp : crypto.createHash("sha256").update(response.otp).digest("hex"),
            expiresAt : Date.now() + (3 * 60 * 1000) 
        }, {
            upsert : true, new : true
        })


        return res.status(200).json({
            success : true,
            message : "OTP has been sent your email, verify OTP and then delete your account"
        }) 
    }
    catch(err){
        return res.status(400).json({
            success : false,
            message : err.message || "Oops something went wrong"
        })
    }
}

const deleteUserVerifyOtp = async(req, res) => {
    try{
        const {user} = req
        const {otp} = req.body

        const otpStored = await otpModel.findOne({user : user._id, purpose : "deleteAccount"})

        if(!otpStored){
            return res.status(400).json({
                success : false,
                message : "OTP has been expired"
            })
        }

        let cleanOtp = String(otp).trim()

        const response = await verifyOtp(otpStored.otp, cleanOtp)

        if(!response.success){
            return res.status(400).json({
                success : false,
                message : response.message ||"Oops something went wrong"
            })
        }

        await userModel.findByIdAndDelete(user._id)
        await otpStored.deleteOne()
        
        return res.status(200).json({
            success : true,
            message : "Your account has been deleted successfully"
        })
    }
    catch(err){
        return res.status(400).json({
            success : false,
            message : err.message ||"Oops something went wrong"
        })
    }
}



module.exports = {
    updatePassword,
    getUser,
    deleteUserSendOtp,
    deleteUserVerifyOtp
}
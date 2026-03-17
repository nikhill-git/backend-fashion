const bcrypt = require("bcrypt")
const validator = require("validator")
const userModel = require("../models/user.model")
const sendOtp = require("../helpers/sendOtp.helper.js")
const verifyOtp = require("../helpers/verifyOtp.helper.js")


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

const deleteUser = async(req, res) => {
    try{
        const data = await userModel.findByIdAndDelete(req.user._id)

        return res.status(204).json({
            success : true,
            message : "Your account has been deleted successfully"
        }) 
    }
    catch(err){
        return res.status(400).json({
            success : false,
            message : err.message || "Oops something went wrong"
        })
    }
}


module.exports = {
    updatePassword,
    getUser,
    deleteUser,
    editUser
}
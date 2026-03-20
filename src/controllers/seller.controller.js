
const {validateSellerSchema} = require("../helpers/validateSeller")
const sellerModel = require("../models/sellers.model")
const crypto = require("crypto")
const bcrypt = require("bcrypt")
const mongoose = require("mongoose")
const validateSellerUpdates = require("../helpers/validatesellerUpdateData")
const accountModel = require("../models/account.model")

const createSeller = async(req, res) => {
    try{
        const {user} = req

        if(user._id.toString() !== req.body.seller || user.role === "seller"){
            return res.status(400).json({
                success : false,
                message : "not a valid seller id"
            })
        }

        const isAlreadySeller = await sellerModel.findOne({seller : req.body.seller})
        if(isAlreadySeller){
            return res.status(400).json({
                success : false,
                message : "Seller account alreadu exists"
            })
        }
        
        if(!user.isAccountVerified || !user.isAccountActive){
            return res.status(400).json({
                success : false,
                message : "Not a valid account"
            })
        }

        const response = validateSellerSchema.safeParse(req.body)
        
        if(!response.success){
            return res.status(400).json({
                success : false,
                message : response.error.message || "Oops something went wrong"
            })
        }

        response.data.contact = await bcrypt.hash(req.body.contact, 10)

        const session = await mongoose.startSession()
        session.startTransaction()

        const seller = await sellerModel.create([response.data], {session})

        user.role = "seller"
        await user.save({session})

        await session.commitTransaction()
        session.endSession()

        return res.status(201).json({
            success : true,
            message : "seller doc has been successfully created",
            data : seller
        })
    }
    catch(err){
        return res.status(400).json({
            success : false,
            message : err.message || "Oops something went wrong"
        })
    }
}

const updateSeller = async(req, res) => {
    try{
        const {user} = req;
        const userData = req.body

        const VALID_UPDATES = ["storeName", "category", "address", "contact"]

        const isUpdateValid  = Object.keys(userData).forEach((key) => VALID_UPDATES.includes(key))

        if(!isUpdateValid){
            return res.status(400).json({
                success : false,
                message : "Invlaid updates"
            })
        }
        
        const response = validateSellerUpdates.safeParse(userData)
        
        if(!response.success){
            return res.status(400).json({
                success : false,
                message : response.error.message || "Invalid Data"
            })
        }
        
        const updatedUser = await accountModel.findByIdAndUpdate(user._id, userData, {new : true})
        
        if(!updatedUser){
            return res.status(400).json({
                success : false,
                message : "Oops something went wrong"
            })
        }
        
        return res.status(200).json({
            success : true,
            message : "User updated successfully",
            user : updatedUser
        })
    }
    catch(err){

    }
}


module.exports = {
    createSeller,
    updateSeller,
}
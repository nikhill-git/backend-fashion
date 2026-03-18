const jwt = require("jsonwebtoken")
const accountModel = require("../models/account.model")
const authenticate = async(req, res, next) => {
    try{
        const {token} = req.cookies
        if(!token){
            return res.status(401).json({success : false, message : "Invalid token"})
        }
        
        const decoded = jwt.verify(token, process.env.JWT_TOKEN)
        const {userId} = decoded
        
        const user = await accountModel.findById(userId)
        
        if(!user){
            return res.status(404).json({success : false, message : "User not found"})
        }

        req.user = user;
        next()
    }
    catch(err){
        return res.status(400).json({
            success : false,
            message : "Not authorized"
        })
    }
}

module.exports = {authenticate}
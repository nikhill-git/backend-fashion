const jwt = require("jsonwebtoken")
const userModel = require("../models/users.model")
const userAuthMiddleware = async(req, res, next) => {
    try{
        const {token} = req.cookies
        if(!token){
            return res.status(401).json({success : false, message : "token is missing login and try again"})
        }

        const {userId} = jwt.verify(token, process.env.JWT_SECRET_TOKEN)

        const user = await userModel.findOne({_id : userId})

        if(!user){
            return res.status(404).json({success : false, message : "user not found"})
        }

        req.user = user
        next()
    }
    catch(err){
        return res.status(400).json({
            success : true,
            message : err.message || "Oops something went wrong"
        })
    }
}

module.exports = userAuthMiddleware
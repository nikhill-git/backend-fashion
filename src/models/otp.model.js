const mongoose = require("mongoose")

const otpSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "accounts",
        required :  [true, "userId is required to otp focument"],
    },
    otp : {
        type : String,
        default : ""
    },
    expiresAt : {
        type : Number,
        default : () => new Date(Date.now() + 3 * 60 * 1000)
    },
    purpose : {
        type : String,
        required : [true, "You must tell the purppose of creating this document"],
        enum : {
            values : ["resetPassword", "verifyAccount", "deleteAccount", "login", "order", "deactivateSeller"],
            message : " NOT a valid value"
        },
        unique : true
    },
}, {timestamps : true})

otpSchema.index({expiresAt : 1}, {expireAfterSeconds : 0})

module.exports = mongoose.model("otps", otpSchema)




const mongoose = require("mongoose")

const otpSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "users",
        required :  [true, "userId is required to otp focument"],
    },
    otp : {
        type : String,
        default : ""
    },
    otpCreatedAt : {
        type : Number,
        default : 0
    },
    purpose : {
        type : String,
        required : [true, "You must tell the purppose of creating this document"],
        enum : {
            values : ["resetPassword", "verifyAccount", "deleteAccount", "login", "order"],
            message : " NOT a valid value"
        }
    }
})


module.exports = mongoose.model("otps", otpSchema)

const crypto = require("crypto")

const verifyOtp = async(hashedOTP, userOTP) => {
    try{
        if(!hashedOTP || !userOTP){
            return {
                success : false,
                message : "Required values are missing"
            }
        }

        const hashedUserOTP = crypto.createHash("sha256").update(String(userOTP).trim()).digest("hex")

        const otpBuffer = Buffer.from(hashedOTP, 'hex')
        const userOtpBuffer = Buffer.from(hashedUserOTP, 'hex')

        if(otpBuffer.length !== userOtpBuffer.length){
            return {
                success : false,
                message : "Invalid OTP"
            }
        }
        
        const isOtpValid = crypto.timingSafeEqual(otpBuffer, userOtpBuffer)
        
        if(!isOtpValid){
            return {
                success : false,
                message : "Invalid OTP"
            }
        }

        return {
            success : true,
            message : "OTP verification successfully completed"
        }
    }
    catch(err){
        return {
            success : false,
            message : err.message || "Oops something went wrong"
        }
    }
}

module.exports = verifyOtp
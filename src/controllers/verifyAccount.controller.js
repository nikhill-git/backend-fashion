const {transporter} = require("../config/nodemailer")
const crypto = require("crypto")
const sendOtp = require("../helpers/sendOtp.helper")
const verifyOtp = require("../helpers/verifyOtp.helper")

//use same api for resendin the OTP
const verifyAccountSendOtp = async(req, res) => {
    try{
        const {user} = req

        if(user.isAccountVerified){
            return res.status(400).json({
                success : false,
                message : "Account already verified"
            })
        }

        //Rate limiting check
        if(user.verifyOtpExpiredAt && (user.verifyOtpExpiredAt - (3 * 60 * 1000)) + 60000 > Date.now()){
            return res.status(429).json({success : false, message : "please wait for 60s before requesting for new OTP"})
        }

        const subject = "Verify your account"
        const text = `Use this OTP to verify your account. OTP expires in 3mins`
        
        const result = await sendOtp(user.email, subject, text)

        if(!result.success){
            return res.status(400).json({success : false, message : result.message})
        }

        user.verifyOtp = crypto.createHash("sha256").update(result.otp).digest('hex')
        user.verifyOtpExpiredAt = Date.now() + (3 * 60 * 1000)

        await user.save()

        return res.status(200).json({success : true, message : "OTP has been sent to your email successfully"})
    }
    catch(err){
        return res.status(400).json({
            success : false,
            message : err.message || "Oops something went wrong"
        })
    }
}

const verifyAccountOtp = async(req, res) => {
    try{
        const {user} = req
        const {userOTP} = req.body

        if(!userOTP || userOTP.length !== 6){
            return res.status(400).json({
                success : false, 
                message : "OTP is not valid"
            })
        }
        
        //if the user's document in DB contains OTP credentials
        //if user is sending the OTP after 3 mins
        //if anyone is hitting this apii without even sending the OTP, res is sent back
        if(!user.verifyOtp ||  Date.now() > user.verifyOtpExpiredAt ){
            return res.status(400).json({
                success : false, 
                message : "OTP expired. Resend OTP"
            })
        }
        
        const result = await verifyOtp(user.verifyOtp, userOTP)
        
        if(!result.success){
            return res.status(400).json({
                success : false, 
                message : err.message || "Invalid OTP"
            })
        }

        user.verifyOtp = ''
        user.verifyOtpExpiredAt = 0
        user.isAccountVerified = true

        await user.save()

        return res.status(200).json({
            success : true,
            message : "OTP verified successfully"
        })

    }
    catch(err){
        return res.status(400)
    }
}

module.exports = {
    verifyAccountSendOtp,
    verifyAccountOtp
}
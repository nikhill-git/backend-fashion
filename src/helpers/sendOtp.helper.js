const crypto =  require("crypto")
const {transporter} = require("../config/nodemailer")

const sendOtp = async(toUser, subject, text) => {
    try{
        if(!toUser || !subject || !text){
            return {success : false,message :"Required feilds are missing"}
        }
        
        const OTP = crypto.randomInt(100000, 1000000).toString();
        
        const mailOptions = {
            from : process.env.SENDER_EMAIL,
            to : toUser,
            subject : subject,
            text : `This is your OTP ${OTP}.` + text
        }

        const data = await transporter.sendMail(mailOptions)

        return {
            success : true,
            otp : OTP,
            message : `OTP has been successfully sent to ${toUser}`
        }
    }
    catch(err){
        return {
            success : false,
            message : err.message || "Oops something went wrong"
        }
    }
}

module.exports = sendOtp
const mongoose = require("mongoose")
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    firstName : {
        type : String,
        required : [true, "Name is required to signUp"],
        minlength : [3, "Minimum length of firstName is should be 3 characters"],
        maxlength : [50, "Maximum length of a firstName is should be less than 50 characters"],
    },
    lastName : {
        type : String,
        required : [true, "Name is required to signUp"],
        minlength : [3, "Minimum length of lastName is should be 3 characters"],
        maxlength : [50, "Maximum length of a lastName is should be less than 50 characters"]
    },
    email : {
        type : String,
        required : [true, "Email is required to signUp"],
        unique : true,
        trim : true,
        lowercase : true,
        validate : {
            validator : function(val) {
                return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val)
            },
            message : "Email is not valid"
        },
        immutable : true
    },
    password : {
        type : String,
        required : [true, "password is required to signUp"],
        minlength : [8, "password should contain atleast 8 characters"],
        select : false,
        validate : {
            validator : function(val) {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(val);
            },
            message : "Not a strong password"
        }
    },
    age : {
        type : Number,
        validate : {
            validator : function (val){
                return (val >= 15 && val <= 120)
            },
            message : "Not a valid age"
        }
    },
    gender : {
        type : String,
        lowercase : true,
        enum : {
            values : ['male', 'female', 'other'],
            message : "The included fields are only male, female and others"
        },
        required : [true, "gender is required"]
    },
    interests : {
        type : [{
            type : String,
            minlength : [3, "minlength should be 3"],
            maxlength : [50, "maxlength should be 50"],
        }],
        required : [true, "user interests are required"],
        default : [],
        validate : {
            validator : function (val){
                return val.length >= 0 && val.length <= 15
            },
            message : "Interests allowed 1 - 15"
        }
    },
},{timestamps : true})




userSchema.methods.hashPassword = async function (password) {
    return await bcrypt.hash(password, 10)
}

const userModel = mongoose.model("users", userSchema)

module.exports = userModel
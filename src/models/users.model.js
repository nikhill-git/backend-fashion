const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, "name is required to create an account"],
        minlength : 3,
        maxlength : 30,
        // validate : {
        //     validator : function(name) {
        //       return /^[a-zA-Z\s\-\']+$/.test(name);
        //     },
        //     message : props => `${props.value} is not a valid name.`
        // }
    },
    email : {
        type :String,
        required : [true, "email is required for creating an account"],
        trim : true,
        immuatable : true,
        lowercase : true,
        index : true,
        unique : true,
        validate : {
            validator : function(email) {
                return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
            },
            message : props => `${props.value} is not a valid email`
        }
    },
    password : {
        type : String,
        requried : [true, "Password is required for creating an account"],
        minlength : [6, "password is too small"],
        select : false,
    },
    interests : {
        type : [{
            //validation for each value in the array
            type : String,
            trim : true,
            minlength : [3, "interest is too small"],
            maxlength : [20, "ineterest is too large"]
        }],
        required : [true, "interests are required"],
        maxlength :[30, "only 30 interests are allowed"],
        deafault : []
        //validations for each string in an array
        // of : {
        //     type : String,
        //     trim : true,
        //     minlength : [3, "interest is too small"],
        //     maxlength : [20, "ineterest is too large"]
        // }
    }
}, {
    timestamps : true
})


const User = mongoose.model("User", userSchema)

module.exports = User
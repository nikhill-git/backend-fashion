const mongoose = require("mongoose")

const sellersProducts = new mongoose.Schema({
    seller : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "sellers",
        required : true
    },
    totalProducts : {
        type : Number,
        required : true,
        min : 1
    },
    products : {
        type : [
            {
                type : mongoose.Schema.Types.ObjectId,
                ref : "products",
                required : true
            }
        ],
        min : 1,
        required : true,
        default :[]
    },
    bussinessEmail : {
        type : String,
        required : true,
        unique : true,
        trim : true
    }
})
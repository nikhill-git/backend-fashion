const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
    title : {
        type :String,
        required : true
    },
    price : {
        type : Number,
        required : true,
    },
    category : {
        type :String,
        required : true, index : true,
        lowercase : true,
        trim : true
    },
    brand : {
        type : String,
        required : true
    },
    description : {
        type :String,
        required : true
    },
    rating : {
        type :  mongoose.Schema.Types.Decimal128, 
    },
    discountPercentage : {
        type : Number
    },
    image : {
        type :String,
        required :true
    }
})


const productModel = mongoose.model("products", productSchema)

module.exports = productModel
const mongoose = require("mongoose")

const cartSchema = new mongoose.Schema({
    user_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "users",
        required : true,
        unique : true
    },
    items : [
        {
            product_id : {
                type : mongoose.Schema.Types.ObjectId,
                ref : "products",
                unique : [true , "Product_id should be unique"],
                required : true,
            },
            quantity : {
                type : Number,
                required : [true , "Quantity is required"],
                deafault : 1
            }
        }
    ]
}, {
    timestamps : true
})

const cartModel = mongoose.model("cart", cartSchema)

module.exports = cartModel
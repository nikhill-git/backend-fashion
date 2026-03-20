const {z} = require("zod")

const validateSellerUpdates = z.object({
    storeName : z.string().min(3, "store name is required").optional(),
    category  :  z.string().min(1, "category is required"),
    address : ({
        street : z.string().min(1, "street is required"),
        city : z.string().min(1, "city is required"),
        pincode : z.number().int().positive().refine((val) => val.toString().length === 6, {message : "Not a valid pincode"})
    }).optional(), 
    contact : z.number().refine((val) => val.toString().length === 10, {message : "Not a valid contact number"}).optional()
})

module.exports = validateSellerUpdates
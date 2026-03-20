const {z} = require("zod")

const validateProduct = z.object({
    sellersId : z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
    title : z.string().min(1, "Title is reqquired"),
    price : z.string().Number().int().positive(),
    category : z.string().min(1, "caategory is reqquired"),
    brand : z.string().min(1, "brand is reqquired"),
    discription : z.string().min(1, "discription is reqquired"),
    rating : z.number().int().min(0).max(5),
    discountPercentage : z.number().int(),
    quantity : z.number().int().positive().min(1),
    image : z.string()
}) 

module.exports = validateProduct

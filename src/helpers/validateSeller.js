const {z} = require("zod")

const validateSellerSchema = z.object({
    seller : z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
    storeName : z.string().min(3, "store name is required"),
    status : z.string().toLowerCase().pipe(z.enum(["active", "pending", "suspended"])),
    category : z.string().min(1, "category is required"),
    bussinessEmail : z.email().trim().toLowerCase(),
    address : z.object({
        street : z.string().min(1, "street is required"),
        city : z.string().min(1, "city is required"),
        pincode : z.number().int().positive().refine((val) => val.toString().length === 6, {message : "Not a valid pincode"})
    }),
    contact : z.number().refine((val) => val.toString().length === 10, {message : "Not a valid contact number"}),
    taxPerProduct : z.number().int().refine((val) => val === 0, {message : "No commitment is made"}),
    totalSales : z.number().int().refine((val) => val === 0, {message : "You dont have any sales right now"}),
    rating : z.number().int().min(0).max(5).refine((val) => val === 0, {message : "Still your product dont any kind of reviews"})
})

module.exports = {validateSellerSchema}
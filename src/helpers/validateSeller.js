const {z} = require("zod")

const validateSellerSchema = z.object({
    storeName : z.string().min(3),
    status : z.string().toLowerCase().pipe(z.enum(["active", "pending", "suspended"])),
    category : z.string(),
    bussinessEmail : z.email().trim().toLowerCase(),
    address : z.void(),//va,
    contact : z.number().size(),
    taxPerProduct : z.number(),
    totalSales : z.number(),
    rating : z.number()
})
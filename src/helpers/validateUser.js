const {z, ZodError} = require("zod")

const validateUserSchema = z.object({
  firstName: z.string().min(3).max(50),
  lastName: z.string().min(3).max(50),
  email: z.email().trim().toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters") // Sets minimum length
    .regex(/[A-Z]/, "Must contain at least one uppercase letter") // Custom complexity
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
    age : z.number().min(15, {message : "Minimum age should be 15"}).max(120, {message : "Minimum age should be 15"}),
    gender : z.string().toLowerCase().pipe(z.enum(["male", "female", "other"])),
    interests : z.array(z.string()).min(1).max(10)
});

module.exports = {
    validateUserSchema
}
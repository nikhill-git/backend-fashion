const express = require("express");
require("dotenv").config();
const connectTODB = require("./config/database.js");
const app = express();
const cookieParser = require("cookie-parser")

app.use(express.json())
app.use(cookieParser())
// app.set("trust proxy", true)
const userAuthRoutes = require("./routes/userAuth.routes.js") 
const userAccountRoutes = require("./routes/userAccount.routes.js") 
app.use("/api/auth", userAuthRoutes)
app.use("/api/account", userAccountRoutes)



//product riuet
const productRoutes = require("./routes/products.routes.js")
app.use("/api/products", productRoutes)


app.use("/", (req, res) => {
  res.status(404).send("No URL matched this route");
});

connectTODB()
  .then(() => {
    console.log("Connected to database successfully");
    const PORT = process.env.PORT
    app.listen(PORT || 3000, () => {
      console.log(`Server running on port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error occured in connecting to database : " + err.message);
  })


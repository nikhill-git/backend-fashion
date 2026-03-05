const express = require("express");
require("dotenv").config();
const app = express();
const port = 3333;
const connectToDB = require("./config/database.js");
const cookieParser = require("cookie-parser")
app.use(express.json());
app.use(cookieParser())


const authRouter = require("./routes/userAuth.routes.js")
const productsRouter = require("./routes/products.routes.js")
app.use("/auth", authRouter)
app.use("/products", productsRouter)


app.use("/", (req, res) => {
  res.send("App is running");
});

connectToDB().then(() => {
  console.log("Connected to database successfully");
  app.listen(port, () => {
    console.log("Server created successfully and running on post : " + port);
  })
})
.catch((err) =>{
    console.log("Error in  connecting to database")
    console.log("ERROR : " + err.message )
})


// const productModel = require("./models/products.model.js")

// const {products} = require("./utils/data.js")

// products.map(async(product) => {
//   await productModel.create(product)
// })
// console.log("products added")
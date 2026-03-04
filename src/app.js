const express = require("express");
require("dotenv").config();
const app = express();
const port = 3333;
const connectToDB = require("./config/database.js");

app.use(express.json());

const authRouter = require("./routes/userAuth.routes.js")
app.use("/auth", authRouter)


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

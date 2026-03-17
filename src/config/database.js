const mongoose = require("mongoose");

const connectTODB = async () => {
  await mongoose.connect(process.env.CONNECTION_STRING)
};


module.exports = connectTODB
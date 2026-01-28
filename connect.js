// Set Mongoose to use native ES6 promises
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

require("dotenv").config({
  path: "./application.env",
});

const uri = process.env.CONNECTION_STRING;

mongoose.set("strictQuery", false);
mongoose
  .connect(uri)
  .then(() => {
    console.log("DB Is connected");
  })
  .catch((err) => {
    console.log(err);
  });

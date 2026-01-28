const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");

const address = new mongoose.Schema(
  {
    userId: String,
    location: String,
    street: String,
    address: String,
    landmark: String,
    alternatephone: String,
    locationObj: Object,
  },
  { timestamps: true }
);

autoIncrement.initialize(mongoose.connection);
const useraddress = new mongoose.model("address", address);

module.exports = useraddress;

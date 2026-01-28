const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");

const shippingaddress = new mongoose.Schema(
  {
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
module.exports = shippingaddress;

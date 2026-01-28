const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
const mongooseserial = require("mongoose-serial");

const orderProduct = new mongoose.Schema(
  {
    name: String,
    image: Array,
    quantity: String,
    price: Number,
    unitValue: String,
    unit: String,
    subscription_type: Array,
    start_date: Array,
  },
  { timestamps: true }
);

autoIncrement.initialize(mongoose.connection);

module.exports = orderProduct;

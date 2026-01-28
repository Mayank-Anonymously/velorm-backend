const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");

const cart = new mongoose.Schema(
  {
    cartProduct: Array,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users", index: true },
  },

  { timestamps: true }
);

autoIncrement.initialize(mongoose.connection);

const cartinstance = new mongoose.model("carts", cart);

module.exports = cartinstance;

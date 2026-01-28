const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    order_id:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'order',
      required: true,
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'products',
      required: true,
    },
    rating: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    saveInfo: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

const ratinginstance = mongoose.model("Rating", ratingSchema);
module.exports = ratinginstance;

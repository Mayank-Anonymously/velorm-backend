const mongoose = require("mongoose");

const product = new mongoose.Schema(
  {
    name: { type: String, index: true },
    categoryId: String,
    status: Boolean,
    subCategoryId: String,
    regularPrice: Number,
    price: Number,
    description: String,
    selQty: { type: Number, index: true }, // Adding index to selQty
    location: Array,
    productImage: Array,
    subscription_stat: Boolean,
    subscribed_type: String,
    start_date: String,
    unit: { type: String, enum: ["kg", "gm", "ltr", "ml"], required: true },
    unit_value: Number,
    productType: String,
    subscription_type: Array,
    subscription_active: Boolean,
    membership_offer: String,
    icon: String,
    stock: Number,
    shortDescription: String,
    sgst:Number,
    cgst:Number,
    igst:Number
  },
  { timestamps: true }
);

const productinstance = new mongoose.model("products", product);

module.exports = productinstance;
